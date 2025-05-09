package com.example.soa.Dto;

import org.springframework.hateoas.RepresentationModel;
import java.time.LocalDateTime;
import org.springframework.web.multipart.MultipartFile;

public class ContentDTO extends RepresentationModel<ContentDTO> {
    private Long contentId;
    private Long courseId;
    private String type;
    private String urlFileLocation;
    private LocalDateTime uploadDate;
    private Long fileSize;
    private String fileType;
    private String description;
    private String fileName;
    private String fileUrl;
    private Boolean isActive;
    private Integer orderIndex;
    private MultipartFile file;
    private Long moduleId;

    private String content;
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    // Default constructor
    public ContentDTO() {
    }
    private String title;

public String getTitle() {
    return title;
}

public void setTitle(String title) {
    this.title = title;
}

    // Getters and Setters
    public Long getContentId() {
        return contentId;
    }

    public void setContentId(Long contentId) {
        this.contentId = contentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUrlFileLocation() {
        return urlFileLocation;
    }

    public void setUrlFileLocation(String urlFileLocation) {
        this.urlFileLocation = urlFileLocation;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }
    

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getDescription() {
        return description;
    }


    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
    public MultipartFile getFile() {
        return file;
    }
    public void setFile(MultipartFile file) {
        this.file = file;
    }
    public Long getModuleId() {
        return moduleId;
    }

    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }
}