/**
 * Created by zhoujd on 24/05/2016.
 */

function postSurvey(flex,link) {

    // Retrieve the radio button values
    var question1 = flex;
    var question2 = link;

    /* Validate the response.
     Do nothing more until all questions are answered.
     */
    if (question1 == '' || question2 == '') {
        alert('Please answer all questions.')
        return;
    }

    // Get the current context
    var context = new SP.ClientContext.get_current();

    // Get the current site (SPWeb)
    var web = context.get_web();

    // Get the survey list
    var list = web.get_lists().getByTitle('NimbleTraffic');

    // Create a new list item
    var itemCreateInfo = new SP.ListItemCreationInformation();
    var listItem = list.addItem(itemCreateInfo);

    /* Set fields in the item.
     In managed code, this would be listItem[fieldname] = value.
     In Javascript, call listItem.set_item(fieldName,value).
     */
    listItem.set_item('Title', question1);
    listItem.set_item('ViewLevel', question2);
    listItem.update();

    // Create callback handlers
    var success = Function.createDelegate(this, this.onSuccess);
    var failure = Function.createDelegate(this, this.onFailure);

    // Execute an async query
    context.executeQueryAsync(success,failure);
}
