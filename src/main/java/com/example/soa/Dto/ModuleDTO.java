package com.example.soa.Dto;

import org.springframework.hateoas.RepresentationModel;
import java.util.List;

public class ModuleDTO extends RepresentationModel<ModuleDTO> {
    
    private Long moduleId;
    private Long courseId;
    private String title;
    private String description;
    private List<Long> contentIds;
    private Integer orderIndex;
    
    // Default constructor
    public ModuleDTO() {
    }
    
    // Getters and Setters
    public Long getModuleId() {
        return moduleId;
    }
    
    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }
    
    public Long getCourseId() {
        return courseId;
    }
    
    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public List<Long> getContentIds() {
        return contentIds;
    }
    
    public void setContentIds(List<Long> contentIds) {
        this.contentIds = contentIds;
    }
    
    public Integer getOrderIndex() {
        return orderIndex;
    }
    
    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
}