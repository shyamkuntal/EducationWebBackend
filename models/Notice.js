const Sequelize = require("sequelize");
const db = require("../config/database");
const { User } = require("./User");

const Notice = db.define("notice", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    subject: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    userType: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    sender: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    reciever: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    deleteBySender: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    deleteByReciever: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

Notice.sync().then(() => {
    console.log("Notice Created");
});

Notice.belongsTo(User, {
    foreignKey: { name: "sender" },
});

User.hasMany(Notice, { foreignKey: "sender" });

Notice.belongsTo(User, {
    foreignKey: { name: "reciever" },
});

User.hasMany(Notice, { foreignKey: "reciever" });

module.exports = { Notice }