class PuzzleCompletionElement {

    constructor(
        public puzzleId: number,
        public score: number = Infinity,
        public highscore: number = null
    ) {

    }

    public getStarsCount(): number {
        if (!isFinite(this.score) || this.score === null) {
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
    
    public completedPuzzles: { id: number, score: number }[] = [];

    public storyPuzzleCompletion: number = 0;
    public expertPuzzleCompletion: number = 0;
    public communityPuzzleCompletion: number = 0;

    public storyPuzzles: PuzzleCompletionElement[] = [];
    public expertPuzzles: PuzzleCompletionElement[] = [];
    public communityPuzzles: PuzzleCompletionElement[] = [];


    public getPuzzleCompletionElementById(id: number): PuzzleCompletionElement {
        let storyElement = this.storyPuzzles.find(e => { return e.puzzleId === id; });
        if (storyElement) {
            return storyElement;
        }
        let expertElement = this.expertPuzzles.find(e => { return e.puzzleId === id; });
        if (expertElement) {
            return expertElement;
        }
        let communityElement = this.communityPuzzles.find(e => { return e.puzzleId === id; });
        if (communityElement) {
            return communityElement;
        }
    }

    public getStarCount(id: number): number {
        let element = this.getPuzzleCompletionElementById(id);
        if (element) {
            return element.getStarsCount();
        }
        return 0;
    }

    private _updateStoryPuzzleCompletion(): void {
        let max = this.storyPuzzles.length * 4;
        if (max < 1) {
            return;
        }
        let totalStarsCount = 0;
        this.storyPuzzles.forEach(e => {
            totalStarsCount += e.getStarsCount();
        });
        this.storyPuzzleCompletion = totalStarsCount / max;
    }

    private _updateExpertPuzzleCompletion(): void {
        let max = this.expertPuzzles.length * 4;
        if (max < 1) {
            return;
        }
        let totalStarsCount = 0;
        this.expertPuzzles.forEach(e => {
            totalStarsCount += e.getStarsCount();
        });
        this.expertPuzzleCompletion =  totalStarsCount / max;
    }

    private _updateCommunityPuzzleCompletion(): void {
        let max = this.communityPuzzles.length * 4;
        if (max < 1) {
            return;
        }
        let totalStarsCount = 0;
        this.communityPuzzles.forEach(e => {
            totalStarsCount += e.getStarsCount();
        });
        this.communityPuzzleCompletion = totalStarsCount / max;
    }

    constructor(public game: Game) {
        if (HasLocalStorage) {
            let dataString = window.localStorage.getItem("completed-puzzles-v" + VERSION.toFixed(0));
            if (dataString) {
                this.completedPuzzles = JSON.parse(dataString);
            }
        }
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
                let score = this.getPersonalBestScore(puzzle.id);
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
                let score = this.getPersonalBestScore(puzzle.id);
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
                let score = this.getPersonalBestScore(puzzle.id);
                this.expertPuzzles.push(
                    new PuzzleCompletionElement(puzzle.id, score, puzzle.score)
                );
            })
        }
        catch (e) {

        }

        this._updateStoryPuzzleCompletion();
        this._updateExpertPuzzleCompletion();
        this._updateCommunityPuzzleCompletion();
    }

    public completePuzzle(id: number, score: number): void {
        let comp = this.completedPuzzles.find(comp => { return comp.id === id });
        if (!comp) {
            comp = { id: id, score: score };
            this.completedPuzzles.push(comp)
        }
        else if (comp.score > score) {
            comp.score = Math.min(comp.score, score);
        }

        let e = this.getPuzzleCompletionElementById(id);
        if (e) {
            e.score = Math.min(e.score, score);
        }

        this._updateStoryPuzzleCompletion();
        this._updateExpertPuzzleCompletion();
        this._updateCommunityPuzzleCompletion();

        if (HasLocalStorage) {
            window.localStorage.setItem("completed-puzzles-v" + VERSION.toFixed(0), JSON.stringify(this.completedPuzzles));
        }
    }

    public isPuzzleCompleted(id: number): boolean {
        return this.completedPuzzles.findIndex(comp => { return comp.id === id }) != -1;
    }

    public getPersonalBestScore(id: number): number {
        let comp = this.completedPuzzles.find(comp => { return comp.id === id });
        if (comp) {
            return comp.score;
        }
        return Infinity;
    }
}