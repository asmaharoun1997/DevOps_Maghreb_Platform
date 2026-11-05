package fr.maghreb.platform.media;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

public class LocalStorageService implements StorageService {

    private final Path dir;

    public LocalStorageService(Path dir) {
        this.dir = dir;
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new UncheckedIOException("Impossible de créer le dossier des photos " + dir, e);
        }
    }

    @Override
    public void put(String key, byte[] data, String contentType) {
        try {
            Files.write(dir.resolve(key), data);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public Optional<StoredObject> get(String key) {
        Path file = dir.resolve(key);
        if (!Files.isRegularFile(file)) {
            return Optional.empty();
        }
        try {
            return Optional.of(new StoredObject(Files.readAllBytes(file), MediaTypes.fromKey(key)));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public boolean exists(String key) {
        return Files.isRegularFile(dir.resolve(key));
    }
}
