package com.reservas.app;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.net.InetAddress;

@Component
public class DocumentacionConsola implements ApplicationRunner{
    private static final Logger log = LoggerFactory.getLogger(DocumentacionConsola.class);

    private final Environment env;

    public DocumentacionConsola(Environment env) {
        this.env = env;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        String port = env.getProperty("server.port", "8080");
        String contextPath = env.getProperty("server.servlet.context-path", "");
        String swaggerPath = env.getProperty("springdoc.swagger-ui.path", "/swagger-ui.html");
        String apiDocsPath = env.getProperty("springdoc.api-docs.path", "/v3/api-docs");
        String host = InetAddress.getLocalHost().getHostAddress();

        String localUrl = "http://localhost:" + port + contextPath;
        String networkUrl = "http://" + host + ":" + port + contextPath;

        log.info("\n" +
                        "----------------------------------------------------------\n" +
                        "  Bro los endpoints de {} los podes ver acá:\n" +
                        "  Swagger UI: {}{}\n" +
                        "----------------------------------------------------------",
                env.getProperty("spring.application.name"),
                localUrl, swaggerPath
        );
    }
}
