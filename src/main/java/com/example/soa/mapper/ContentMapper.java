package com.example.soa.mapper;

import com.example.soa.Dto.ContentDTO;
import com.example.soa.Model.Content;
import com.example.soa.Model.Course;
import com.example.soa.Model.Module;

import org.springframework.stereotype.Component;

@Component
public class ContentMapper {

    public ContentDTO toContentDTO(Content content) {
        ContentDTO dto = new ContentDTO();
        dto.setContentId(content.getContentId());
        dto.setCourseId(content.getCourse().getCourseId());
        dto.setType(content.getType().name());
        dto.setUrlFileLocation(content.getUrlFileLocation());
        dto.setUploadDate(content.getUploadDate());
        dto.setFileSize(content.getFileSize());
        dto.setFileType(content.getFileType());
        dto.setDescription(content.getDescription());
        dto.setTitle(content.getTitle());
        dto.setFileName(content.getFileName());
        dto.setFileUrl(content.getFileUrl());
        dto.setIsActive(content.getIsActive());
        dto.setOrderIndex(content.getOrderIndex());
        if (content.getModule() != null) {
            dto.setModuleId(content.getModule().getModuleId());
        }
        return dto;
    }

    public Content toContent(ContentDTO contentDTO) {
        Content content = new Content();
        content.setContentId(contentDTO.getContentId());
        Course course = new Course(contentDTO.getCourseId());
        content.setCourse(course); 
        content.setType(Content.ContentType.valueOf(contentDTO.getType()));
        content.setUrlFileLocation(contentDTO.getUrlFileLocation());
        content.setUploadDate(contentDTO.getUploadDate());
        content.setFileSize(contentDTO.getFileSize());
        content.setFileType(contentDTO.getFileType());
        content.setDescription(contentDTO.getDescription());
        content.setTitle(contentDTO.getTitle());
        content.setFileName(contentDTO.getFileName());
        content.setFileUrl(contentDTO.getFileUrl());
        content.setIsActive(contentDTO.getIsActive());
        content.setOrderIndex(contentDTO.getOrderIndex());
        if (contentDTO.getModuleId() != null) {
            Module module = new Module();
            module.setModuleId(contentDTO.getModuleId());
            content.setModule(module);
        }
        return content;
    }
}