const db = require('../db')

module.exports = class Cycle {
    constructor(id, is_open, drawn_numbers, creation_time, closing_time) {
        this.id = id
        this.is_open = is_open
        this.drawn_numbers = drawn_numbers
        this.creation_time = creation_time
        this.closing_time = closing_time
    }

    static async findCycleById(id) {
        let results = await dbGetCycleById(id)
        if (!results) {
            return "No cycles found."
        }
        return results
    }

    static async findOpenCycle() {
        let results = await dbGetOpenCycle()
        if (!results) {
            return "No cycles found."
        }
        return results
    }

    static async findLastCycle() {
        let results = await dbGetLastCycle();
        if (!results) {
            return "No cycles found."
        }
        return results
    }

    static async closeCycle(id) {
        try {
            await db.query('UPDATE cycle SET is_open = FALSE, closing_time = NOW() WHERE id = $1', [id]);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}



dbGetCycleById = async (id) => {
    const sql = `SELECT * FROM cycle WHERE id = ` + id;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err
    }
}

dbGetOpenCycle = async () => {
    const sql = 'SELECT * FROM cycle WHERE is_open = TRUE';
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err
    }

}

dbGetLastCycle = async () => {
    const sql = 'SELECT * FROM cycle ORDER BY creation_time DESC LIMIT 1';
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err;
    }
}