package com.example.soa.mapper;

import com.example.soa.Dto.ModuleDTO;
import com.example.soa.Model.Module;
import com.example.soa.Model.Content;

import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import com.example.soa.controller.ModuleController;
import com.example.soa.controller.ContentController;

import java.util.List;
import java.util.stream.Collectors;

public class ModuleMapper {
    
    public static ModuleDTO toModuleDTO(Module module) {
        ModuleDTO moduleDTO = new ModuleDTO();
        
        moduleDTO.setModuleId(module.getModuleId());
        moduleDTO.setCourseId(module.getCourse().getCourseId());
        moduleDTO.setTitle(module.getTitle());
        moduleDTO.setDescription(module.getDescription());
        
        // Add HATEOAS links
        moduleDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(ModuleController.class)
                .getModuleById(module.getModuleId())).withSelfRel());
        
        moduleDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(ModuleController.class)
                .getModulesByCourse(module.getCourse().getCourseId())).withRel("modules"));
        
        // Map contents if available
        if (module.getContents() != null && !module.getContents().isEmpty()) {
            List<Long> contentIds = module.getContents().stream()
                    .map(Content::getContentId)
                    .collect(Collectors.toList());
            
            moduleDTO.setContentIds(contentIds);
            
            moduleDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(ModuleController.class)
                    .getModuleContent(module.getModuleId())).withRel("contents"));
        }
        
        return moduleDTO;
    }
    
    public static Module toModule(ModuleDTO moduleDTO) {
        Module module = new Module();
        
        // We typically don't set the ID when converting from DTO to entity for new entities
        if (moduleDTO.getModuleId() != null) {
            module.setModuleId(moduleDTO.getModuleId());
        }
        
        module.setTitle(moduleDTO.getTitle());
        module.setDescription(moduleDTO.getDescription());
        
        // Course and contents would typically be set by the service layer
        
        return module;
    }
}