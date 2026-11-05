package fr.maghreb.platform.media;

import java.net.URI;
import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

@Configuration
public class StorageConfig {

    @Bean
    @ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
    StorageService localStorage(@Value("${app.storage.local-dir}") String dir) {
        return new LocalStorageService(Path.of(dir));
    }

    /**
     * Oracle Object Storage expose une API compatible S3 :
     * endpoint https://NAMESPACE.compat.objectstorage.REGION.oraclecloud.com, adressage "path-style",
     * clés = "Customer Secret Keys" du profil utilisateur OCI.
     */
    @Bean
    @ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
    StorageService s3Storage(@Value("${app.storage.s3.endpoint}") String endpoint,
                             @Value("${app.storage.s3.region}") String region,
                             @Value("${app.storage.s3.bucket}") String bucket,
                             @Value("${app.storage.s3.access-key}") String accessKey,
                             @Value("${app.storage.s3.secret-key}") String secretKey) {
        S3Client client = S3Client.builder()
                .httpClient(UrlConnectionHttpClient.create())
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .build();
        return new S3StorageService(client, bucket);
    }
}
