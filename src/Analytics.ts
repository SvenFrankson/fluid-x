class Analytics {

    constructor(public game: Game) {

    }

    public async sendEvent(eventType: number): Promise<void> {
        let body = {
            puzzle_id: this.game.puzzle.data.id,
            event_type: eventType
        }
        const response = await fetch(SHARE_SERVICE_PATH + "analytics", {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        console.log(await response.text());
    }
}