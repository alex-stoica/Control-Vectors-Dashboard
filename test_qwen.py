from transformers import pipeline

def main():
    generate_pipe = pipeline(
        "text-generation", 
        model="Qwen/Qwen1.5-0.5B",
        device_map="auto"  
    )

    messages = [
        {"role": "user", "content": "Who are you?"}
    ]
    prompt = messages[0]["content"]

    output = generate_pipe(prompt, max_new_tokens=128, do_sample=True)
    print(output[0]["generated_text"])

if __name__ == "__main__":
    main()