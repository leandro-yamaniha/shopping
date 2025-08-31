package com.shopping.controller;

import com.shopping.dto.LoginRequest;
import com.shopping.dto.LoginResponse;
import com.shopping.dto.RegisterRequest;
import com.shopping.model.User;
import com.shopping.service.JwtService;
import com.shopping.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import jakarta.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:19006", "http://127.0.0.1:8090", "http://localhost:8090"})
@Tag(name = "Autenticação", description = "Endpoints para autenticação e registro de usuários")
public class AuthController {
    
    private final UserService userService;
    private final JwtService jwtService;
    
    @Operation(summary = "Registrar novo usuário", description = "Cria uma nova conta de usuário no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuário registrado com sucesso",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponse.class))),
        @ApiResponse(responseCode = "400", description = "Dados inválidos ou email já existe",
                content = @Content),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                content = @Content)
    })
    @PostMapping("/register")
    public Mono<ResponseEntity<LoginResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("POST /api/auth/register - Registering user: {}", request.getEmail());
        
        User user = User.builder()
            .email(request.getEmail())
            .passwordHash(request.getPassword())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .phone(request.getPhone())
            .role(User.UserRole.CUSTOMER)
            .build();
        
        return userService.createUser(user)
            .map(createdUser -> {
                String token = jwtService.generateToken(
                    createdUser.getId(),
                    createdUser.getEmail(),
                    createdUser.getRole().name()
                );
                
                LoginResponse response = LoginResponse.builder()
                    .token(token)
                    .userId(createdUser.getId())
                    .email(createdUser.getEmail())
                    .firstName(createdUser.getFirstName())
                    .lastName(createdUser.getLastName())
                    .role(createdUser.getRole().name())
                    .build();
                
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            })
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.badRequest().build());
    }
    
    @Operation(summary = "Fazer login", description = "Autentica um usuário e retorna um token JWT")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login realizado com sucesso",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponse.class))),
        @ApiResponse(responseCode = "401", description = "Credenciais inválidas",
                content = @Content),
        @ApiResponse(responseCode = "403", description = "Usuário inativo",
                content = @Content),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado",
                content = @Content)
    })
    @PostMapping("/login")
    public Mono<ResponseEntity<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /api/auth/login - Login attempt for: {}", request.getEmail());
        
        return userService.getUserByEmail(request.getEmail())
            .flatMap(user -> {
                return userService.validatePassword(request.getEmail(), request.getPassword())
                    .flatMap(isValid -> {
                        if (!isValid) {
                            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).<LoginResponse>build());
                        }
                        
                        if (!user.getIsActive()) {
                            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<LoginResponse>build());
                        }
                        
                        String token = jwtService.generateToken(
                            user.getId(),
                            user.getEmail(),
                            user.getRole().name()
                        );
                        
                        LoginResponse response = LoginResponse.builder()
                            .token(token)
                            .userId(user.getId())
                            .email(user.getEmail())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .role(user.getRole().name())
                            .build();
                        
                        return Mono.just(ResponseEntity.ok(response));
                    });
            })
            .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
    
    @PostMapping("/validate")
    public Mono<ResponseEntity<Boolean>> validateToken(@RequestHeader("Authorization") String authHeader) {
        log.info("POST /api/auth/validate - Validating token");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Mono.just(ResponseEntity.ok(false));
        }
        
        String token = authHeader.substring(7);
        boolean isValid = jwtService.isTokenValid(token);
        
        return Mono.just(ResponseEntity.ok(isValid));
    }
}
