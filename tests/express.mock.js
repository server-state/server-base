class Express {
    constructor() {
        this.getRoutes = {};
        this.postRoutes = {};
    }

    get(path, cb) {
        this.getRoutes[path] = cb;
    }

    async __executeGET(path, user) {
        let data = '';
        let status = 200;

        await this.getRoutes[path]({user},
            {
                json: (d) => {
                    data = JSON.stringify(d);
                    return data;

                }, status: (newStatus) => {
                    status = newStatus;
                    return ({send: d => data = JSON.stringify(d)});
                }
            });
        return {data: data, status};
    }
}

function express() {
    return new Express();
}

module.exports = express;
