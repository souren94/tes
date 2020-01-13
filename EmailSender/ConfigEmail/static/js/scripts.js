function create_email_address(col){
    var selectList = document.createElement("select");
    selectList.id = "email_address_column_selection";
    selectList.setAttribute('class', 'form-control')
    for (var i = 0; i < col.length; i++) {
        var option = document.createElement("option");
        option.value = col[i];
        option.text = col[i];
        selectList.appendChild(option);
    }
    var divContainer = document.getElementById("email_address_filed");
    divContainer.innerHTML = "";
    divContainer.appendChild(selectList);
}


function CeateTrableFromJSON(response) {
        var myBooks = JSON.parse(response);
        // EXTRACT VALUE FOR HTML HEADER. 
        // ('Book ID', 'Book Name', 'Category' and 'Price')
        var col = [];
        for (var i = 0; i < myBooks.length; i++) {
            for (var key in myBooks[i]) {
                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }

        // CREATE DYNAMIC TABLE.
        var table = document.createElement("table");
        table.setAttribute('class', 'table table-striped table-bordered table-hover');
        //console.log(table);

        // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

        var tr = table.insertRow(-1);                   // TABLE ROW.

        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th"); 
            th.setAttribute('class', 'thead-dark')     // TABLE HEADER.
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        // ADD JSON DATA TO THE TABLE AS ROWS.
        for (var i = 0; i < myBooks.length; i++) {

            tr = table.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = myBooks[i][col[j]];
            }
        }
        
        // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
        var divContainer = document.getElementById("tableview");
        divContainer.innerHTML = "";
        divContainer.appendChild(table);
        create_email_address(col);
    }

	$(document).ready(function() {
        $('#fileuploadbtn').click(function(e){
            e.preventDefault();
            var data = new FormData($('#file_upload').get(0));
            data.append('file', $('#email_address_file')[0].files);
            $.ajax({
                headers: { "X-CSRFToken": $.cookie("csrftoken") },
                url: 'upload_email_address',
                type: 'POST',
                data: data,
                success: function (response) {
                    CeateTrableFromJSON(response);
                    $('.error').remove();
                    if(response.error){
                        $.each(response.errors, function(name, error){
                            error = '<small class="text-muted error">' + error + '</small>'
                            $form.find('[name=' + name + ']').after(error);
                        })
                    }
                    else{
                        //alert(response.message)
                        //window.location = ""
                    }
                },
                cache: false,
                contentType: false,
                processData: false
            });
        });
    });


    $(document).ready(function() {
        $('#sendEmail').click(function(e){
            $("#loading").show();
            e.preventDefault(); 
		    var data = new FormData($('#email_id_column').get(0));
            data.append('col', $('#email_address_column_selection')[0].value);
            $.ajax({
                headers: { "X-CSRFToken": $.cookie("csrftoken") },
                url: 'email_address_column_selection',
                type: 'POST',
                data: data,
                success: function (response) {
                    console.log(response);
                    display(response)
                    $('.error').remove();
                    if(response.error){
                        $.each(response.errors, function(name, error){
                            error = '<small class="text-muted error">' + error + '</small>'
                            $form.find('[name=' + name + ']').after(error);
                        })
                    }
                },
                cache: false,
                contentType: false,
                processData: false
            });
        });
    });

function display(response){
    response = JSON.stringify(response)
    response = JSON.parse(response)
    message = response['message'].replace(/\[/g, '').replace(/]/g, '').split(",")
    var ol = document.createElement('ol');
    ol.innerHTML = "Successfully email sent below email ids";
    for(var i = 0; i<message.length; i++){
        var li = document.createElement("li");
        li.innerHTML = message[i];
        ol.appendChild(li);
    }

    var divContainer = document.getElementById("tableview");
    divContainer.innerHTML = "";
    divContainer.appendChild(ol);
    $("#loading").hide();

}

