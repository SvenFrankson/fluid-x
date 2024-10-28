interface IPuzzleData {
    id: number;
    title: string;
    author: string;
    content: string;
    numLevel?: number;
    score?: number;
    player?: string;
    state?: number;
    story_order?: number;
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
}

interface IPuzzlesData {
    puzzles: IPuzzleData[];
}

function CLEAN_IPuzzlesData(data: any): any {
    for (let i = 0; i < data.puzzles.length; i++) {
        if (data.puzzles[i].id != null && typeof(data.puzzles[i].id) === "string") {
            data.puzzles[i].id = parseInt(data.puzzles[i].id);
        }
        if (data.puzzles[i].score != null && typeof(data.puzzles[i].score) === "string") {
            data.puzzles[i].score = parseInt(data.puzzles[i].score);
        }
        if (data.puzzles[i].state != null && typeof(data.puzzles[i].state) === "string") {
            data.puzzles[i].state = parseInt(data.puzzles[i].state);
        }
        if (data.puzzles[i].story_order != null && typeof(data.puzzles[i].story_order) === "string") {
            data.puzzles[i].story_order = parseInt(data.puzzles[i].story_order);
        }
    }
}