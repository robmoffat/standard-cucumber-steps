package io.github.robmoffat.world;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import io.cucumber.java.Scenario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Cucumber World class that holds test state in a props map.
 */
public class PropsWorld implements Map<String, Object> {

    private static final Logger logger = LoggerFactory.getLogger(PropsWorld.class);

    private final Map<String, Object> props = new HashMap<>();
    private Scenario scenario;

    public Map<String, Object> getProps() {
        return props;
    }

    public Object get(String key) {
        return props.get(key);
    }

    public void set(String key, Object value) {
        props.put(key, value);
    }

    public boolean has(String key) {
        return props.containsKey(key);
    }

    public void setScenario(Scenario scenario) {
        this.scenario = scenario;
    }

    public Scenario getScenario() {
        return scenario;
    }

    public void log(String message) {
        logger.info(message);
        if (scenario != null) {
            scenario.log(message);
        }
    }

    public void attach(byte[] data, String mediaType, String name) {
        if (scenario != null) {
            scenario.attach(data, mediaType, name);
        }
    }

    public void attach(String data, String mediaType) {
        if (scenario != null) {
            scenario.attach(data, mediaType, null);
        }
    }

    @Override
    public int size() {
        return props.size();
    }

    @Override
    public boolean isEmpty() {
        return props.isEmpty();
    }

    @Override
    public boolean containsKey(Object key) {
        return props.containsKey(key);
    }

    @Override
    public boolean containsValue(Object value) {
        return props.containsValue(value);
    }

    @Override
    public Object get(Object key) {
        return props.get(key);
    }

    @Override
    public Object put(String key, Object value) {
        return props.put(key, value);
    }

    @Override
    public Object remove(Object key) {
        return props.remove(key);
    }

    @Override
    public void putAll(Map<? extends String, ? extends Object> m) {
        props.putAll(m);
    }

    @Override
    public void clear() {
        props.clear();
    }

    @Override
    public Set<String> keySet() {
        return props.keySet();
    }

    @Override
    public Collection<Object> values() {
        return props.values();
    }

    @Override
    public Set<Entry<String, Object>> entrySet() {
        return props.entrySet();
    }
}
