const db = require('../db')

module.exports = class Ticket {
    constructor(id, cycle_id, player_id, chosen_numbers, creation_time) {
        this.id = id
        this.cycle_id = cycle_id
        this.player_id = player_id
        this.chosen_numbers = chosen_numbers
        this.creation_time = creation_time
    }

    async createTicket(cycle_id, player_id, chosen_numbers) {
        try {
            let id = await dbCreateTicket(cycle_id, player_id, chosen_numbers)
            this.id = id
            return this
        } catch(e) {
            console.log(e)
            throw e
        }
    }

    async findTicketById(id) {
        let results = await dbFindTicketById(id)
        if (!results) {
            return "No ticket found."
        }
        return results
    }

    static async countByCycle(cycle_id) {
        const results = await dbCountTicketsByCycle(cycle_id);
        return results;
    }

}

dbCreateTicket = async (cycle_id, player_id, chosen_numbers) => {
    const sql = `INSERT INTO ticket (cycle_id, player_id, chosen_numbers)
        VALUES ($1, $2, $3) RETURNING id`;
    const values = [cycle_id, player_id, chosen_numbers];
    try {
        const result = await db.query(sql, values);
        return result.rows[0].id;
    } catch (e) {
        console.log(e);
        throw e
    }
}

dbFindTicketById = async (id) => {
    const sql = `SELECT * FROM ticket WHERE id = $1`;
    try {
        const result = await db.query(sql, [id]);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw e
    }
}

const dbCountTicketsByCycle = async (cycle_id) => {
    const sql = `SELECT COUNT(*) FROM ticket WHERE cycle_id = $1`;
    const result = await db.query(sql, [cycle_id]);
    return parseInt(result.rows[0].count, 10);
}

