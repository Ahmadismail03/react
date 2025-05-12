package com.example.soa.controller;

import com.example.soa.Dto.ContentDTO;
import com.example.soa.Model.Content;
import com.example.soa.Model.Course;
import com.example.soa.Model.Module;
import com.example.soa.Model.User;
import com.example.soa.exception.ContentNotFoundException;
import com.example.soa.exception.AccessDeniedException;
import com.example.soa.Service.ContentService;
import com.example.soa.Service.ContentAccessService;
import com.example.soa.Service.CourseService;
import com.example.soa.security.UserPrincipal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/content")
@Tag(name = "Content Management", description = "APIs for managing course content")
public class ContentController {

    private static final Logger logger = LoggerFactory.getLogger(ContentController.class);

    @Autowired
    private ContentService contentService;
    
    @Autowired
    private ContentAccessService contentAccessService;
    
    @Autowired
    private CourseService courseService;

    @Operation(summary = "Upload new content")
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ContentDTO> uploadContent(
            @ModelAttribute ContentDTO contentDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            logger.info("Uploading new content for course ID: {}", contentDTO.getCourseId());
            
            // Validate that user can upload content for this course
            Course course = courseService.getCourseById(contentDTO.getCourseId());
            if (!currentUser.getRole().name().equals("ADMIN") && 
                !course.getInstructor().getUserId().equals(currentUser.getId())) {
                logger.warn("User {} attempting to upload content for course they don't own", currentUser.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Validate input
            if (contentDTO.getCourseId() == null) {
                logger.warn("Course ID is required");
                return ResponseEntity.badRequest().body(contentDTO);
            }
            
            if (contentDTO.getTitle() == null || contentDTO.getTitle().trim().isEmpty()) {
                logger.warn("Title is required");
                return ResponseEntity.badRequest().body(contentDTO);
            }
            
            if (contentDTO.getType() == null || contentDTO.getType().trim().isEmpty()) {
                logger.warn("Content type is required");
                return ResponseEntity.badRequest().body(contentDTO);
            }
            
            if ((contentDTO.getUrlFileLocation() == null || contentDTO.getUrlFileLocation().trim().isEmpty()) 
                && contentDTO.getFile() == null) {
                logger.warn("URL file location is required unless a file is uploaded");
                return ResponseEntity.badRequest().body(contentDTO);
            }
            
            Content content = new Content();
            content.setCourse(course);
            
            if (contentDTO.getContent() != null) {
                content.setContent(contentDTO.getContent());
            } else {
                content.setContent("");
            }
            
            try {
                content.setType(Content.ContentType.valueOf(contentDTO.getType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid content type: {}", contentDTO.getType());
                return ResponseEntity.badRequest().body(contentDTO);
            }
            
            // Handle file upload
            if (contentDTO.getFile() != null && !contentDTO.getFile().isEmpty()) {
                try {
                    String uploadDir = System.getProperty("user.dir") + "/uploads/";
                    java.io.File dir = new java.io.File(uploadDir);
                    if (!dir.exists()) {
                        boolean created = dir.mkdirs();
                        if (!created) {
                            logger.error("Failed to create directory: {}", uploadDir);
                            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(contentDTO);
                        }
                        logger.info("Created directory: {}", uploadDir);
                    }
                    String originalFilename = contentDTO.getFile().getOriginalFilename();
                    String filePath = uploadDir + System.currentTimeMillis() + "_" + originalFilename;
                    logger.info("Saving file to: {}", filePath);
                    java.io.File dest = new java.io.File(filePath);
                    contentDTO.getFile().transferTo(dest);
                    
                    content.setFileUrl(filePath);
                    content.setFileName(originalFilename);
                    content.setFileSize(dest.length());
                    String fileType = contentDTO.getFile().getContentType();
                    content.setFileType(fileType != null ? fileType : "unknown");
                    content.setUrlFileLocation(filePath);
                } catch (Exception ex) {
                    logger.error("Failed to save uploaded file: {}", ex.getMessage(), ex);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(contentDTO);
                }
            } else {
                // Handle URL-based content
                content.setUrlFileLocation(contentDTO.getUrlFileLocation());
                
                if (contentDTO.getFileSize() != null && contentDTO.getFileSize() > 0) {
                    content.setFileSize(contentDTO.getFileSize());
                } else {
                    logger.warn("Invalid file size provided");
                    return ResponseEntity.badRequest().body(contentDTO);
                }
                
                if (contentDTO.getFileType() != null && !contentDTO.getFileType().trim().isEmpty()) {
                    content.setFileType(contentDTO.getFileType());
                } else {
                    logger.warn("File type is required");
                    return ResponseEntity.badRequest().body(contentDTO);
                }
                
                if (contentDTO.getFileName() != null && !contentDTO.getFileName().trim().isEmpty()) {
                    content.setFileName(contentDTO.getFileName());
                }
                
                if (contentDTO.getFileUrl() != null && !contentDTO.getFileUrl().trim().isEmpty()) {
                    content.setFileUrl(contentDTO.getFileUrl());
                }
            }
            
            // Set remaining properties
            content.setTitle(contentDTO.getTitle());
            
            if (contentDTO.getDescription() != null) {
                content.setDescription(contentDTO.getDescription());
            }
            
            if (contentDTO.getModuleId() != null) {
                Module module = new Module();
                module.setModuleId(contentDTO.getModuleId());
                content.setModule(module);
            }
            
            content.setUploadDate(java.time.LocalDateTime.now());
            content.setIsActive(contentDTO.getIsActive() != null ? contentDTO.getIsActive() : true);
            content.setOrderIndex(contentDTO.getOrderIndex() != null ? contentDTO.getOrderIndex() : 0);
            
            Content savedContent = contentService.uploadContent(content);
            
            // Map back to DTO
            contentDTO.setContentId(savedContent.getContentId());
            contentDTO.setUploadDate(savedContent.getUploadDate());
            contentDTO.setFileName(savedContent.getFileName());
            contentDTO.setFileUrl(savedContent.getFileUrl());
            contentDTO.setIsActive(savedContent.getIsActive());
            contentDTO.setOrderIndex(savedContent.getOrderIndex());
            
            contentDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(ContentController.class)
                .getContent(savedContent.getContentId())).withSelfRel());
            
            logger.info("Content uploaded successfully with ID: {}", savedContent.getContentId());
            return ResponseEntity.ok(contentDTO);
        } catch (Exception e) {
            logger.error("Error uploading content: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "Upload new content using JSON")
    @PostMapping(value = "/upload-json", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ContentDTO> uploadContentJson(
            @RequestBody ContentDTO contentDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            logger.info("Uploading new content via JSON for course ID: {}", contentDTO.getCourseId());
            
            // Validate that user can upload content for this course
            Course course = courseService.getCourseById(contentDTO.getCourseId());
            if (!currentUser.getRole().name().equals("ADMIN") && 
                !course.getInstructor().getUserId().equals(currentUser.getId())) {
                logger.warn("User {} attempting to upload content for course they don't own", currentUser.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Validation logic (same as upload method)
            if (contentDTO.getCourseId() == null) {
                logger.warn("Course ID is required");
                return ResponseEntity.badRequest().body(contentDTO);
            }
            
            if (contentDTO.getTitle() == null || contentDTO.getTitle().trim().isEmpty()) {
                logger.warn("Title is required");
                return ResponseEntity.badRequest().body(contentDTO);
            }
            
            if (contentDTO.getType() == null || contentDTO.getType().trim().isEmpty()) {
                logger.warn("Content type is required");
                return ResponseEntity.badRequest().body(contentDTO);
            }
            
            if (contentDTO.getUrlFileLocation() == null || contentDTO.getUrlFileLocation().trim().isEmpty()) {
                logger.warn("URL file location is required");
                return ResponseEntity.badRequest().body(contentDTO);
            }
            
            Content content = new Content();
            content.setCourse(course);
            
            try {
                content.setType(Content.ContentType.valueOf(contentDTO.getType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid content type: {}", contentDTO.getType());
                return ResponseEntity.badRequest().body(contentDTO);
            }
            
            // Set URL location
            content.setUrlFileLocation(contentDTO.getUrlFileLocation());
            
            // Set required fields
            if (contentDTO.getFileSize() != null && contentDTO.getFileSize() > 0) {
                content.setFileSize(contentDTO.getFileSize());
            } else {
                logger.warn("Invalid file size provided");
                return ResponseEntity.badRequest().body(contentDTO);
            }
            
            if (contentDTO.getFileType() != null && !contentDTO.getFileType().trim().isEmpty()) {
                content.setFileType(contentDTO.getFileType());
            } else {
                logger.warn("File type is required");
                return ResponseEntity.badRequest().body(contentDTO);
            }
            
            if (contentDTO.getFileName() != null && !contentDTO.getFileName().trim().isEmpty()) {
                content.setFileName(contentDTO.getFileName());
            }
            
            if (contentDTO.getFileUrl() != null && !contentDTO.getFileUrl().trim().isEmpty()) {
                content.setFileUrl(contentDTO.getFileUrl());
            }
            
            // Set title and description
            content.setTitle(contentDTO.getTitle());
            
            if (contentDTO.getDescription() != null) {
                content.setDescription(contentDTO.getDescription());
            }
            
            // Set content
            content.setContent(contentDTO.getContent() != null ? contentDTO.getContent() : "");
            
            // Set module if provided
            if (contentDTO.getModuleId() != null) {
                Module module = new Module();
                module.setModuleId(contentDTO.getModuleId());
                content.setModule(module);
            }
            
            // Set metadata
            content.setUploadDate(java.time.LocalDateTime.now());
            content.setIsActive(contentDTO.getIsActive() != null ? contentDTO.getIsActive() : true);
            content.setOrderIndex(contentDTO.getOrderIndex() != null ? contentDTO.getOrderIndex() : 0);
            
            Content savedContent = contentService.uploadContent(content);
            
            // Map back to DTO
            contentDTO.setContentId(savedContent.getContentId());
            contentDTO.setUploadDate(savedContent.getUploadDate());
            contentDTO.setFileName(savedContent.getFileName());
            contentDTO.setFileUrl(savedContent.getFileUrl());
            contentDTO.setIsActive(savedContent.getIsActive());
            contentDTO.setOrderIndex(savedContent.getOrderIndex());
            
            contentDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(ContentController.class)
                .getContent(savedContent.getContentId())).withSelfRel());
            
            logger.info("Content uploaded successfully with ID: {}", savedContent.getContentId());
            return ResponseEntity.ok(contentDTO);
            
        } catch (Exception e) {
            logger.error("Error uploading content: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "Get content for a specific course")
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseContent(@PathVariable Long courseId) {
        try {
            logger.info("Fetching content for course ID: {}", courseId);
            List<Content> contents = contentService.getCourseContent(courseId);
            
            // Filter contents based on user access permissions
            List<Content> accessibleContents = contents.stream()
                .filter(content -> contentAccessService.hasAccessToContent(content))
                .collect(Collectors.toList());
            
            List<ContentDTO> contentDTOs = accessibleContents.stream().map(content -> {
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
                dto.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(ContentController.class)
                    .getContent(content.getContentId())).withSelfRel());
                return dto;
            }).collect(Collectors.toList());
            
            logger.info("Fetched {} accessible content items for course ID: {}", contentDTOs.size(), courseId);
            return ResponseEntity.ok(contentDTOs);
        } catch (Exception e) {
            logger.error("Error fetching course content: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch course content: " + e.getMessage()));
        }
    }

    @Operation(summary = "Get content by ID")
    @GetMapping("/{contentId}")
    public ResponseEntity<?> getContent(@PathVariable Long contentId) {
        try {
            logger.info("Fetching content with ID: {}", contentId);
            Content content = contentService.getContentById(contentId);
            
            // Verify user has access to this content
            contentAccessService.verifyContentAccess(content);
            
            ContentDTO contentDTO = new ContentDTO();
            contentDTO.setContentId(content.getContentId());
            contentDTO.setCourseId(content.getCourse().getCourseId());
            contentDTO.setType(content.getType().name());
            contentDTO.setUrlFileLocation(content.getUrlFileLocation());
            contentDTO.setUploadDate(content.getUploadDate());
            contentDTO.setFileSize(content.getFileSize());
            contentDTO.setFileType(content.getFileType());
            contentDTO.setDescription(content.getDescription());
            contentDTO.setTitle(content.getTitle());
            contentDTO.setFileName(content.getFileName());
            contentDTO.setFileUrl(content.getFileUrl());
            contentDTO.setIsActive(content.getIsActive());
            contentDTO.setOrderIndex(content.getOrderIndex());
            contentDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(ContentController.class)
                .getContent(contentId)).withSelfRel());
            contentDTO.setModuleId(content.getModule() != null ? content.getModule().getModuleId() : null);
            
            logger.info("Fetched content with ID: {}", contentId);
            return ResponseEntity.ok(contentDTO);
        } catch (AccessDeniedException e) {
            logger.warn("Access denied to content ID {}: {}", contentId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        } catch (ContentNotFoundException e) {
            logger.warn("Content not found with ID: {}", contentId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching content: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch content: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "Update content")
    @PutMapping("/{contentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<?> updateContent(
            @PathVariable Long contentId,
            @RequestBody ContentDTO contentDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            logger.info("Updating content with ID: {}", contentId);
            
            Content existingContent = contentService.getContentById(contentId);
            Course course = existingContent.getCourse();
            
            // Verify user has permission to update this content
            if (!currentUser.getRole().name().equals("ADMIN") && 
                !course.getInstructor().getUserId().equals(currentUser.getId())) {
                logger.warn("User {} attempting to update content for course they don't own", currentUser.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Update content fields
            existingContent.setTitle(contentDTO.getTitle());
            existingContent.setDescription(contentDTO.getDescription());
            existingContent.setContent(contentDTO.getContent() != null ? contentDTO.getContent() : "");
            existingContent.setIsActive(contentDTO.getIsActive());
            existingContent.setOrderIndex(contentDTO.getOrderIndex());
            
            Content updatedContent = contentService.updateContent(existingContent);
            
            // Map to DTO
            contentDTO.setContentId(updatedContent.getContentId());
            contentDTO.setUploadDate(updatedContent.getUploadDate());
            contentDTO.setCourseId(updatedContent.getCourse().getCourseId());
            
            return ResponseEntity.ok(contentDTO);
        } catch (Exception e) {
            logger.error("Error updating content: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update content: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "Delete content")
    @DeleteMapping("/{contentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<?> deleteContent(
            @PathVariable Long contentId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            logger.info("Deleting content with ID: {}", contentId);
            
            Content content = contentService.getContentById(contentId);
            Course course = content.getCourse();
            
            // Verify user has permission to delete this content
            if (!currentUser.getRole().name().equals("ADMIN") && 
                !course.getInstructor().getUserId().equals(currentUser.getId())) {
                logger.warn("User {} attempting to delete content for course they don't own", currentUser.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            contentService.deleteContent(contentId);
            
            logger.info("Content deleted successfully with ID: {}", contentId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting content: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete content: " + e.getMessage()));
        }
    }
}