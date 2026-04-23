class Analytics {

    constructor(public game: Game) {

    }

    public async sendEvent(eventType: number): Promise<void> {
        if (OFFLINE_MODE) {
            return;
        }
        if (USE_POKI_SDK) {
            return;
        }
        if (USE_WAVEDASH_SDK) {
            return;
        }
        let body = {
            puzzle_id: this.game.puzzle.data.id,
            event_type: eventType,
            top_host: TOP_HOST
        }
        await fetch(SHARE_SERVICE_PATH + "analytics", {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    }
}