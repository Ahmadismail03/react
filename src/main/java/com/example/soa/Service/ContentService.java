package com.example.soa.Service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.soa.Model.Content;
import com.example.soa.Model.Course;
import com.example.soa.exception.ContentNotFoundException;
import com.example.soa.Repository.ContentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ContentService {
    private static final Logger logger = LoggerFactory.getLogger(ContentService.class);
    
    @Autowired
    private ContentRepository contentRepository;
    
    public Content uploadContent(Content content) {
        logger.info("Uploading content for course ID: {}", content.getCourse().getCourseId());
        Content savedContent = contentRepository.save(content);
        logger.info("Content uploaded successfully with ID: {}", savedContent.getContentId());
        return savedContent;
    }
    
    public List<Content> getCourseContent(Long courseId) {
        logger.info("Fetching content for course ID: {}", courseId);
        List<Content> contents = contentRepository.findByCourse_CourseId(courseId);
        logger.info("Fetched {} content items for course ID: {}", contents.size(), courseId);
        return contents;
    }
    
    public Content getContentById(Long contentId) {
        logger.info("Fetching content with ID: {}", contentId);
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ContentNotFoundException("Content not found with ID: " + contentId));
        logger.info("Fetched content with ID: {}", contentId);
        return content;
    }
    
    public Content updateContent(Content content) {
        logger.info("Updating content with ID: {}", content.getContentId());
        
        // Verify content exists
        Content existingContent = contentRepository.findById(content.getContentId())
                .orElseThrow(() -> new ContentNotFoundException("Content not found with ID: " + content.getContentId()));
        
        // Update the content
        Content updatedContent = contentRepository.save(content);
        logger.info("Content updated successfully with ID: {}", updatedContent.getContentId());
        return updatedContent;
    }
    
    public void deleteContent(Long contentId) {
        logger.info("Deleting content with ID: {}", contentId);
        
        // Verify content exists
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ContentNotFoundException("Content not found with ID: " + contentId));
        
        contentRepository.delete(content);
        logger.info("Content deleted successfully with ID: {}", contentId);
    }
}