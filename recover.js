const fs = require('fs');
const path = require('path');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\Thofadev\\.gemini\\antigravity-ide\\brain\\9d74e6e2-88e9-4a36-8f6d-ad65f4091c78\\.system_generated\\logs\\transcript_full.jsonl';
const targetDir = 'C:\\Users\\Thofadev\\.gemini\\antigravity-ide\\scratch\\socialhub\\socialhub-app\\resources\\js';

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

console.log('Reading transcript to recover React files...');

const fileStream = fs.createReadStream(transcriptPath);
const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

let recoveredFiles = 0;
const writtenPaths = new Set(); // To keep the most recent version of each file

// We will read the file and store all write_to_file events, then process them in order so the last one wins.
const writes = [];

rl.on('line', (line) => {
    try {
        const obj = JSON.parse(line);
        if (obj.tool_calls && Array.isArray(obj.tool_calls)) {
            for (const call of obj.tool_calls) {
                if (call.function && call.function.name === 'default_api:write_to_file') {
                    let args = call.function.arguments;
                    if (typeof args === 'string') {
                        try {
                            args = JSON.parse(args);
                        } catch (e) {
                            continue;
                        }
                    }
                    if (args && args.TargetFile && args.CodeContent) {
                        // Check if it's a frontend src file
                        if (args.TargetFile.includes('frontend/src') || args.TargetFile.includes('frontend\\src')) {
                            writes.push(args);
                        }
                    }
                }
            }
        }
    } catch (e) {
        // ignore malformed lines
    }
});

rl.on('close', () => {
    console.log(`Found ${writes.length} write operations to frontend/src.`);
    
    // Process writes in order, so the latest edit is the one we keep
    for (const write of writes) {
        // Extract the relative path after 'src'
        const parts = write.TargetFile.split(/frontend[\\\/]src[\\\/]/);
        if (parts.length > 1) {
            const relPath = parts[1];
            const finalPath = path.join(targetDir, relPath);
            
            // Ensure directory exists
            const dir = path.dirname(finalPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(finalPath, write.CodeContent, 'utf8');
            writtenPaths.add(relPath);
        }
    }
    
    console.log(`Successfully recovered ${writtenPaths.size} files into resources/js!`);
    console.log('Files recovered:');
    for (const f of writtenPaths) {
        console.log(' - ' + f);
    }
});
