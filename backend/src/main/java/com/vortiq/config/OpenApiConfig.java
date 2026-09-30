package com.vortiq.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI 3.0 (Swagger) Specification Configuration
 * Exposes interactive API documentation at /swagger-ui/index.html
 * Configured for VortiQ Workspace Major Project Defense.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI flowviaOpenAPI() {
        final String securitySchemeName = "BearerAuth";

        return new OpenAPI()
            .info(new Info()
                .title("Flowvia Workspace — Enterprise Multi-Tenant API")
                .description("REST API documentation for Flowvia Workspace & ERP Platform. " +
                             "Designed for B.Tech Major Project viva demonstration. " +
                             "Includes Task Kanban, Project Management, ML Priority Forecasting, and ERP Suite.")
                .version("1.0.0")
                .contact(new Contact()
                    .name("Deepanshi Kaushal (Lead Architect)")
                    .email("deepanshikaushal@gmail.com")
                    .url("https://github.com/Deepanshikaushal/vortiq_workspace"))
                .license(new License().name("MIT License").url("https://opensource.org/licenses/MIT")))
            .servers(List.of(
                new Server().url("/").description("Current Server (Local / Public Tunnel)"),
                new Server().url("http://localhost:8080").description("Local Development Backend")
            ))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName,
                    new SecurityScheme()
                        .name(securitySchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Provide a valid JWT token obtained from /api/auth/login or /api/auth/register")));
    }
}
