'use strict';

module.exports = ({app}) => {
    const eventController = require('./eventController');

    app.route('/recent_events')
        .get(eventController.list_recent_events);
    // .post(todoList.create_a_task);


    // app.route('/tasks/:taskId')
    //     .get(todoList.read_a_task)
    //     .put(todoList.update_a_task)
    //     .delete(todoList.delete_a_task);
};
