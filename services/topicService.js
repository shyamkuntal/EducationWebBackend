const { Topic, SubTopic } = require("../models/Topic");
const { Vocabulary } = require("../models/Vocabulary");

const createTopic = async ({
  name
}) => {
  try {
    let topic = await Topic.create({
      name
    });

    return topic;
  } catch (err) {
    throw err;
  }
};

const createSubTopic = async ({
  name
}) => {
  try {
    let subtopic = await SubTopic.create({
      name
    });

    return subtopic;
  } catch (err) {
    throw err;
  }
};

const createVocabulary = async ({
  name
}) => {
  try {
    let vocabulary = await Vocabulary.create({
      name
    });

    return vocabulary;
  } catch (err) {
    throw err;
  }
};

module.exports = { createTopic, createSubTopic, createVocabulary };