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

        OllamaAPI ollamaAPI = new OllamaAPI(ollamaURL); 
        ollamaAPI.setRequestTimeoutSeconds(60);
        ollamaAPI.setVerbose(true);
        OptionsBuilder optionsBuilder = new OptionsBuilder()
                                .setTemperature(0) //// Lower temperature for more deterministic responses
                                .setTopP((float)0.5) //Lower Top P for more focused output
                                .setSeed(42); // Setting a seed for reproducibility

        String formatInstructions = "Respond in the following format as JSON. Ignore the Places field if the question above did not ask anything about places:\n" +
                "{ \"Main\": <Main Response>,\n" +
                "\"Places\": [ \"Place\": <Your answer on place with city/country name included>, \"Explanation\": <Your explanation and description of place>, \"Address\": <Full address of place>\n";
        OllamaResult ollamaResult = ollamaAPI.generate(OllamaModelType.MISTRAL, 
        question + "\n" + formatInstructions, optionsBuilder.build());
        System.out.println(ollamaResult.getResponse());
        return ollamaResult.getResponse();
    }

}
