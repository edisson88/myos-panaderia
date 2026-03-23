import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { AxiosError } from 'axios';
import { HasuraResponse } from '../../common/interfaces/hasura-response.interface';

/**
 * Generic Hasura GraphQL client.
 *
 * Responsibilities:
 *   - Send queries / mutations to Hasura via HTTP
 *   - Authenticate with x-hasura-admin-secret
 *   - Surface Hasura-level GraphQL errors as NestJS exceptions
 *
 * This service has NO business logic. All domain rules live in the
 * feature repositories and services that consume it.
 */
@Injectable()
export class HasuraService {
  private readonly logger = new Logger(HasuraService.name);
  private readonly endpoint: string;
  private readonly adminSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.endpoint = this.configService.get<string>(
      'HASURA_GRAPHQL_ENDPOINT',
    )!;
    this.adminSecret = this.configService.get<string>(
      'HASURA_ADMIN_SECRET',
    )!;
  }

  /**
   * Executes a GraphQL query or mutation.
   *
   * @param gql  - The GraphQL operation string
   * @param variables - Optional variables map
   * @returns The `data` field from the Hasura response, typed as T
   * @throws InternalServerErrorException on network errors or GraphQL errors
   */
  async query<T>(
    gql: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<HasuraResponse<T>>(
          this.endpoint,
          { query: gql, variables },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-hasura-admin-secret': this.adminSecret,
            },
          },
        ),
      );

      const { data, errors } = response.data;

      if (errors && errors.length > 0) {
        const messages = errors.map((e) => e.message).join(' | ');
        this.logger.error(`Hasura GraphQL error: ${messages}`);
        throw new InternalServerErrorException(
          `Data layer error: ${messages}`,
        );
      }

      return data;
    } catch (error) {
      // Re-throw already-handled NestJS exceptions
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      if (error instanceof TimeoutError) {
        this.logger.error('Hasura request timed out');
        throw new InternalServerErrorException(
          'Data layer request timed out',
        );
      }

      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const msg = axiosError.message;
      this.logger.error(
        `Hasura HTTP error [${status ?? 'unknown'}]: ${msg}`,
      );
      throw new InternalServerErrorException(
        'Failed to communicate with the data layer',
      );
    }
  }
}
