package fr.maghreb.platform.media;

import java.util.Optional;

/**
 * Stockage des photos produits. Deux implémentations, choisies par configuration (app.storage.type) :
 *  - local : dossier sur disque (développement, ou volume persistant)
 *  - s3    : stockage objet compatible S3 (Oracle Object Storage, MinIO, AWS S3...)
 */
public interface StorageService {

    record StoredObject(byte[] data, String contentType) {
    }

    void put(String key, byte[] data, String contentType);

    Optional<StoredObject> get(String key);

    boolean exists(String key);
}
