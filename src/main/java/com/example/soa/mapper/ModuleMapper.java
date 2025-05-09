package com.example.soa.mapper;

import com.example.soa.Model.Module;
import com.example.soa.Model.Content;
import com.example.soa.Dto.ModuleDTO;
import java.util.stream.Collectors;

public class ModuleMapper {
    public static ModuleDTO toModuleDTO(Module module) {
        ModuleDTO dto = new ModuleDTO();
        dto.setModuleId(module.getModuleId());
        dto.setCourseId(module.getCourse() != null ? module.getCourse().getCourseId() : null);
        dto.setTitle(module.getTitle());
        dto.setDescription(module.getDescription());
        if (module.getContents() != null) {
            dto.setContentIds(module.getContents().stream().map(Content::getContentId).collect(Collectors.toList()));
        }
        return dto;
    }

    public static Module toModule(ModuleDTO dto) {
        Module module = new Module();
        module.setModuleId(dto.getModuleId());
        // Course association should be set elsewhere if needed
        module.setTitle(dto.getTitle());
        module.setDescription(dto.getDescription());
        return module;
    }
}