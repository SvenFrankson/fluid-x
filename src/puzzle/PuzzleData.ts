interface IPuzzleData {
    id: number;
    title: string;
    author: string;
    content: string;
    haiku?: string;
    numLevel?: number;
    score?: number;
    player?: string;
    state?: number;
    story_order?: number;
    difficulty?: number;
    expert_puzzle_id?: number;
}

function CLEAN_IPuzzleData(data: any): any {
    if (data.id != null && typeof(data.id) === "string") {
        data.id = parseInt(data.id);
    }
    if (data.score != null && typeof(data.score) === "string") {
        data.score = parseInt(data.score);
    }
    if (data.state != null && typeof(data.state) === "string") {
        data.state = parseInt(data.state);
    }
    if (data.story_order != null && typeof(data.story_order) === "string") {
        data.story_order = parseInt(data.story_order);
    }
    if (data.difficulty != null && typeof(data.difficulty) === "string") {
        data.difficulty = parseInt(data.difficulty);
    }
    if (data.expert_puzzle_id != null && typeof(data.expert_puzzle_id) === "string") {
        data.expert_puzzle_id = parseInt(data.expert_puzzle_id);
    }
    if (data.content && typeof(data.content) === "string") {
        if (data.content.indexOf("[HAIKU]") != -1) {
            let pslit = data.content.split("[HAIKU]");
            data.content = pslit[0];
            data.haiku = pslit[1].replaceAll("\\n", "\n");
        }
    }
}

interface IPuzzlesData {
    puzzles: IPuzzleData[];
}

function CLEAN_IPuzzlesData(data: any): any {
    for (let i = 0; i < data.puzzles.length; i++) {
        CLEAN_IPuzzleData(data.puzzles[i]);
    }
}