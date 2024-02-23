$(document).ready(function() {
    

    var url;
    $.getJSON('/config', function(data) {
            console.log(data);   
	    // Use configuration values
                var ipAddress = data.ipAddress;
                var port = data.port;

                // Construct URL
                url = 'http://' + ipAddress + ':' + port + '/services';
                // Fetch service data initially
                fetchServiceData();

                });

    // Define the IP address and port for the JSON request
    /*var ipAddress = '<%= ipAddress %>';
    var port = '<%= port %>';
    var url = 'http://' + ipAddress + ':' + port + '/services';*/
    
   /* var url;
    $.getJSON('/config', function(data) {
                // Use configuration values
                var ipAddress = data.ipAddress;
                var port = data.port;

                // Construct URL
                url = 'http://' + ipAddress + ':' + port + '/services';
                // Fetch service data initially
                fetchServiceData();

                });

*/



    // Event delegation for toggle button click
    $('#serviceTable').on('click', '.toggleBtn', function() {
        var $toggleBtn = $(this);
        var $row = $toggleBtn.closest('tr');
        var serviceName = $row.find('.serviceName').text();
        var status = $row.find('.serviceStatus').text();
        var action = (status === 'active') ? 'stop' : 'start';
        
        // Send request to start or stop service
        sendRequest(action, serviceName, function(success) {
            if (success) {
                // Update status text
                $row.find('.serviceStatus').text((action === 'start') ? 'active' : 'inactive');
                // Update button text based on status
                $toggleBtn.text(($row.find('.serviceStatus').text() === 'active') ? 'Stop' : 'Start');
                
                // Check the status and change button color accordingly
                if ($row.find('.serviceStatus').text() === 'active') {
                    $toggleBtn.css({
                        'background-color': 'red',
                        'border-color': 'red'
                    });
                } else {
                    $toggleBtn.css({
                        'background-color': 'green',
                        'border-color': 'green'
                    });
                }
            }
        });
    });

    // Function to fetch service data
    function fetchServiceData() {
        // Fetch JSON data from the backend
        $.getJSON(url, function(data) {
            console.log(data);
            var uniqueIdCounter = 1; // Initialize a counter for unique IDs

            for (var serviceName in data) {
                if (data.hasOwnProperty(serviceName)) {
                    (function(serviceName, status) {
                        // Load service row template
                        $.get('serviceRow.html')
                            .done(function(template) {
                                try {
                                    // Create a jQuery object from the template
                                    var $row = $(template);

                                    // Populate data
                                    $row.find('.serviceName').text(serviceName).css('color', 'white');
                                    $row.find('.serviceStatus').text(status).css('color', 'white');

                                    // Generate unique IDs for this row
                                    var uniqueId = 'row_' + uniqueIdCounter++;

                                    // Set unique IDs for row and its elements
                                    $row.attr('id', uniqueId);
                                    $row.find('.toggleBtn').attr('id', uniqueId + '_toggle');
                                    var $toggleBtn = $row.find('.toggleBtn');

                                    // Set initial text and styles for toggle button
                                    if (status === 'active') {
                                        $toggleBtn.text('Stop');
                                        $toggleBtn.css({
                                            'background-color': 'red',
                                            'border-color': 'red'
                                        });
                                    } else {
                                        $toggleBtn.text('Start');
                                        $toggleBtn.css({
                                            'background-color': 'green',
                                            'border-color': 'green'
                                        });
                                    }

                                    // Append the row to the table
                                    $('#serviceTable tbody').append($row);
                                    $('.loader').contents().find('.content').hide();
                                    $('.h1_title').show();
                                    $('.container').show();

                                } catch (error) {
                                    console.error("Error processing service:", error);
                                }
                            })
                            .fail(function(xhr, status, error) {
                                console.error("Error loading service row template:", error);
                            });
                    })(serviceName, data[serviceName]);
                }
            }
        });
    }

    // Function to send request to backend
    function sendRequest(action, serviceName, callback) {
        // Send HTTP request to backend
        $.ajax({
            url: `${url}/${serviceName}`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ action: action }),
            success: function(response) {
                console.log("success");
                // Call the callback with success as true
                callback(true);
            },
            error: function() {
                console.log("failed");
                // Call the callback with success as false
                callback(false);
            }
        });
    }

});

