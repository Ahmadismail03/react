package com.example.soa.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI openAPI() {
        Contact contact1 = new Contact()
                .name("Ahmad Ismail")
                .email("Ahmadsarawi2003@gmail.com");
        
        Contact contact2 = new Contact()
                .name("Fadi Anoustas")
                .email("anoustasfadi@gmail.com");
        
        Contact contact3 = new Contact()
                .name("Sohayb Hajjaj")
                .email("202201756@bethlehem.edu");

        return new OpenAPI()
                .info(new Info()
                        .title("LMS API Documentation")
                        .description("API documentation for Learning Management System\n\n" +
                                   "Additional Contacts:\n" +
                                   "- " + contact2.getName() + " (" + contact2.getEmail() + ")\n" +
                                   "- " + contact3.getName() + " (" + contact3.getEmail() + ")")
                        .version("1.0")
                        .contact(contact1));
    }
}