package fr.maghreb.platform.post;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = "author")
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);

    @EntityGraph(attributePaths = "author")
    List<Comment> findByPostIdInOrderByCreatedAtAsc(Collection<Long> postIds);
}
