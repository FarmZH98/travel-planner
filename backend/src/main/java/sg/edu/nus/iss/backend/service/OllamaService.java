package sg.edu.nus.iss.backend.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.github.amithkoujalgi.ollama4j.core.OllamaAPI;
import io.github.amithkoujalgi.ollama4j.core.exceptions.OllamaBaseException;
import io.github.amithkoujalgi.ollama4j.core.models.OllamaResult;
import io.github.amithkoujalgi.ollama4j.core.types.OllamaModelType;
import io.github.amithkoujalgi.ollama4j.core.utils.OptionsBuilder;

@Service
public class OllamaService {

    @Value("${public.ollama.host}")
    private String ollamaURL;
    
    public String chatWithOllama(String question) throws OllamaBaseException, 
            IOException, InterruptedException {

        OllamaAPI ollamaAPI = new OllamaAPI("http://localhost:11434/"); //run locally
        ollamaAPI.setRequestTimeoutSeconds(60);
        ollamaAPI.setVerbose(true);
        
        OllamaResult ollamaResult = ollamaAPI.generate(OllamaModelType.MISTRAL, 
        question, new OptionsBuilder().build());
        System.out.println(ollamaResult.getResponse());
        return ollamaResult.getResponse();
    }

}
