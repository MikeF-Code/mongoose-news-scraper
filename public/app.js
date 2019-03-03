document.addEventListener('DOMContentLoaded', function() {
  var commentModalInit = document.querySelector('.modal');
  var commentModal = M.Modal.init(commentModalInit);
  $(".tooltipped").tooltip();

  var getArticles = function() {
    $("#articles").empty();
    $.getJSON("/articles", function(data) {
      for (var i = 0; i < data.length; i++) {
        var articleCard = $("<div>");
        articleCard.addClass("card");
        articleCard.attr("data-id", data[i]._id);
        articleCard.html("<div class='card-content'><span class='card-title'><a href='"+data[i].link+"' target='_blank'>"+data[i].title+"</a></span></div><div class='card-action'><a class='commentLink' data-id='"+data[i]._id+"'>Comments</a></div>");
        $("#articles").prepend(articleCard);
      }
    });
  }
  
  getArticles();

  $(document).on("click", function() {
    if (!commentModal.isOpen) {
      $("#comments").empty();
      $("#saveCommentFooter").empty();
      $("#commentEntry").val("");
      M.textareaAutoResize($("#commentEntry"));
    }
  });


  $(document).on("click", ".commentLink", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "GET",
      url: "/comments/" + thisId
    })
      .then(function(data) {
        commentModal.open();
        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            $("#comments").append("<li class='collection-item commentItem'><div>"+data[i].body+"<a class='secondary-content deleteComment' data-commentId='"+data[i]._id+"'><i class='material-icons'>cancel</i></a></div></li>");
          }
        }
        $("#saveCommentFooter").append("<a class='modal-close waves-effect waves-green btn-flat' id='saveComment' data-id='" + thisId + "'>Submit</a>");
      });
  });
  
  
  $(document).on("click", "#saveComment", function() {
    var thisId = $(this).attr("data-id");
    $("#comments").empty();
    $("#saveCommentFooter").empty();
    $.ajax({
      method: "POST",
      url: "/comments/" + thisId,
      data: {
        articleID: thisId,
        body: $("#commentEntry").val()
      }
    })
      .then(function(data) {
        $("#commentEntry").val("");
        M.textareaAutoResize($("#commentEntry"));
      });
  });

  $("#scrape").on("click", function(event) {
    event.preventDefault();
    $.ajax({
      method: "GET",
      url: "/scrape"
    })
      .then(function() {
      M.toast({html: '<p>Grabbing new articles, please wait...<p><br><div class="preloader-wrapper small active"><div class="spinner-layer spinner-red-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>', displayLength: 15000});
      setTimeout(getArticles, 15000);
      });
  });

  $(document).on("click", ".deleteComment", function(event) {
    event.preventDefault();
    var thisId = $(this).attr("data-commentId");
    $(this).parents(".commentItem").remove();
    $.ajax({
      method: "GET",
      url: "/comments/delete/" + thisId
    })
  })

});