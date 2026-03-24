import { useState } from "react";
import {
    Box,
    Button,
    Container,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
    Stack,
    Link,
    useTheme,
    alpha,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import loginBg from "../assets/login_bg.png"; // Usamos la imagen generada

const loginSchema = z.object({
    email: z.string().email("Correo electrónico inválido").min(1, "El correo es obligatorio"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (data: LoginFormData) => {
        // Simulación de funcionamiento del login
        console.log("Login form submitted:", data);
        
        // Redirigir al dashboard tras validación exitosa
        navigate("/");
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: "hidden",
                zIndex: 1400,
            }}
        >
            {/* Video Background */}
            <Box
                component="video"
                autoPlay
                loop
                muted
                playsInline
                poster={loginBg}
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "translate(-50%, -50%)",
                    zIndex: 0,
                }}
            >
                <source 
                    src="https://videos.pexels.com/video-files/2959290/2959290-hd_1280_720_30fps.mp4" 
                    type="video/mp4" 
                />
            </Box>

            {/* Overlay */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                    zIndex: 1,
                }}
            />

            <Container maxWidth="xs" sx={{ position: "relative", zIndex: 2 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 4.5,
                        borderRadius: 4,
                        backdropFilter: "blur(20px) saturate(180%)",
                        backgroundColor: alpha(theme.palette.background.paper, 0.85),
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        textAlign: "center",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                    }}
                >
                    <Box sx={{ mb: 4.5 }}>
                        <Typography
                            variant="h1"
                            sx={{
                                color: theme.palette.primary.main,
                                fontSize: "2.5rem",
                                fontWeight: 900,
                                mb: 0.5,
                                letterSpacing: "-1px",
                            }}
                        >
                            MYOS
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            sx={{ 
                                fontWeight: 700, 
                                opacity: 0.8, 
                                textTransform: "uppercase", 
                                letterSpacing: 1.2,
                                fontSize: "0.75rem"
                            }}
                        >
                            Panadería & Delikatessen
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={2.5}>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Usuario / Email"
                                        fullWidth
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Email sx={{ color: "text.secondary", fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2.5,
                                                bgcolor: alpha(theme.palette.background.default, 0.4),
                                            },
                                        }}
                                    />
                                )}
                            />

                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Contraseña"
                                        type={showPassword ? "text" : "password"}
                                        fullWidth
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock sx={{ color: "text.secondary", fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        sx={{ color: "text.secondary" }}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2.5,
                                                bgcolor: alpha(theme.palette.background.default, 0.4),
                                            },
                                        }}
                                    />
                                )}
                            />

                            <Box sx={{ textAlign: "right", mt: -1 }}>
                                <Link
                                    href="#"
                                    underline="hover"
                                    sx={{
                                        fontSize: "0.82rem",
                                        fontWeight: 600,
                                        color: theme.palette.secondary.main,
                                    }}
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </Box>

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                sx={{
                                    mt: 2,
                                    py: 1.8,
                                    borderRadius: 3,
                                    bgcolor: theme.palette.primary.main,
                                    fontWeight: 800,
                                    fontSize: "1.05rem",
                                    boxShadow: `0 8px 20px -6px ${alpha(theme.palette.primary.main, 0.5)}`,
                                    "&:hover": {
                                        bgcolor: theme.palette.primary.dark,
                                        transform: "translateY(-1px)",
                                        boxShadow: `0 12px 25px -8px ${alpha(theme.palette.primary.main, 0.6)}`,
                                    },
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                            >
                                Iniciar Sesión
                            </Button>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
                                ¿Necesitas acceso?{" "}
                                <Link
                                    href="#"
                                    sx={{
                                        color: theme.palette.primary.main,
                                        fontWeight: 700,
                                        textDecoration: "none",
                                        "&:hover": { textDecoration: "underline" },
                                    }}
                                >
                                    Contacta a la Administración
                                </Link>
                            </Typography>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}
