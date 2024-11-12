class PuzzleCompletionElement {

    constructor(
        public puzzleId: number,
        public score: number = null,
        public highscore: number = null
    ) {

    }

    public getStarsCount(): number {
        if (this.score === null) {
            return 0;
        }
        if (this.highscore === null) {
            return 4;
        }
        let ratio = this.highscore / this.score;
        let starsCount = 1;
        let s1 = ratio > 0.3 ? 1 : 0;
        let s2 = ratio > 0.6 ? 1 : 0;
        let s3 = ratio > 0.9 ? 1 : 0;

        return starsCount + s1 + s2 + s3;
    }
}

class PuzzleCompletion {
    
    public storyPuzzles: PuzzleCompletionElement[] = [];
    public expertPuzzles: PuzzleCompletionElement[] = [];
    public communityPuzzles: PuzzleCompletionElement[] = [];

    public getStoryPuzzleCompletion(): number {
        let max = this.storyPuzzles.length * 4;
        if (max < 1) {
            return 0;
        }
        let totalStarsCount = 0;
        this.storyPuzzles.forEach(e => {
            totalStarsCount += e.getStarsCount();
        });
        return totalStarsCount / max;
    }

    public getExpertPuzzleCompletion(): number {
        let max = this.expertPuzzles.length * 4;
        if (max < 1) {
            return 0;
        }
        let totalStarsCount = 0;
        this.expertPuzzles.forEach(e => {
            totalStarsCount += e.getStarsCount();
        });
        return totalStarsCount / max;
    }

    public getCommunityPuzzleCompletion(): number {
        let max = this.communityPuzzles.length * 4;
        if (max < 1) {
            return 0;
        }
        let totalStarsCount = 0;
        this.communityPuzzles.forEach(e => {
            totalStarsCount += e.getStarsCount();
        });
        return totalStarsCount / max;
    }

    constructor(public game: Game) {
        
    }

    public async initialize(): Promise<void> {
        try {
            const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/200/2", {
                method: "GET",
                mode: "cors"
            });
            if (!response.ok) {
                throw new Error("Response status: " + response.status);
            }
            let storyPuzzles: IPuzzlesData = await response.json();
            CLEAN_IPuzzlesData(storyPuzzles);

            storyPuzzles.puzzles.forEach(puzzle => {
                let score = this.game.getPersonalBestScore(puzzle.id);
                this.storyPuzzles.push(
                    new PuzzleCompletionElement(puzzle.id, score, puzzle.score)
                );
            })
        }
        catch (e) {

        }

        try {
            const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/200/1", {
                method: "GET",
                mode: "cors"
            });
            if (!response.ok) {
                throw new Error("Response status: " + response.status);
            }
            let communityPuzzles: IPuzzlesData = await response.json();
            CLEAN_IPuzzlesData(communityPuzzles);

            communityPuzzles.puzzles.forEach(puzzle => {
                let score = this.game.getPersonalBestScore(puzzle.id);
                this.communityPuzzles.push(
                    new PuzzleCompletionElement(puzzle.id, score, puzzle.score)
                );
            })
        }
        catch (e) {

        }
        try {
            const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/200/3", {
                method: "GET",
                mode: "cors"
            });
            if (!response.ok) {
                throw new Error("Response status: " + response.status);
            }
            let expertPuzzles: IPuzzlesData = await response.json();
            CLEAN_IPuzzlesData(expertPuzzles);

            expertPuzzles.puzzles.forEach(puzzle => {
                let score = this.game.getPersonalBestScore(puzzle.id);
                this.expertPuzzles.push(
                    new PuzzleCompletionElement(puzzle.id, score, puzzle.score)
                );
            })
        }
        catch (e) {

        }
    }
}