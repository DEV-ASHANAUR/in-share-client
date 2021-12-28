const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn");
const fileInput = document.querySelector("#fileInput");

const progressContainer = document.querySelector('.progress-container');
const bgProgress = document.querySelector(".progress-container .bg-progress");
const percentDiv = document.querySelector("#percent");
const prograssBar = document.querySelector(".progress-bar");
const fileURL = document.querySelector("#fileURL");
const sharingContainer = document.querySelector('.sharing-container');
const copyBtn = document.querySelector('#copyBtn');
const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector(".toast");

const host = "https://in-share-now-app.herokuapp.com";
const uploadUrl = `${host}/api/files`;
const emailURL = `${host}/api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024; //100mb

dropZone.addEventListener("dragover",(e)=>{
    e.preventDefault();
    sharingContainer.style.display="none";
   if(!dropZone.classList.contains('dragged')){
    dropZone.classList.add('dragged');
   }
});

dropZone.addEventListener("dragleave",()=>{
    dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop",(e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    if (files.length === 1) {
        if (files[0].size < maxAllowedSize) {
            fileInput.files = files;
            uploadFile();
        } else {
            showToast("Max file size is 100MB");
        }
    } else if (files.length > 1) {
        showToast("You can't upload multiple files");
    }
})

browseBtn.addEventListener("click",()=>{
    fileInput.click();
});
// when browse any item
fileInput.addEventListener("change",()=>{
    if (fileInput.files[0].size > maxAllowedSize) {
        showToast("Max file size is 100MB");
        fileInput.value = ""; // reset the input
        return;
    }
    uploadFile();
})
//copyBtn
copyBtn.addEventListener("click",()=>{
    fileURL.select()
    document.execCommand('copy');
    showToast("Copied to clipboard");
})

//upload files
const uploadFile = async() =>{
    progressContainer.style.display = "block";
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("myfile",file);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if(xhr.readyState === XMLHttpRequest.DONE){
            console.log(xhr.response);
            showLink(JSON.parse(xhr.response));
        }
    }
    xhr.upload.onprogress = (e)=>{
        const percent = Math.round((e.loaded / e.total)*100);
        bgProgress.style.width = `${percent}%`;
        percentDiv.innerText = percent;
        prograssBar.style.transform = `scaleX(${percent/100})`;
    }
    xhr.open("POST", uploadUrl);
    xhr.send(formData);
    //show link
    const showLink = ({file})=>{
        console.log(file);
        fileURL.value = file;
        progressContainer.style.display = "none";
        sharingContainer.style.display = "block";
    }
}

// email send
emailForm.addEventListener("submit", (e) => {
    e.preventDefault(); // stop submission
  
    // disable the button
    emailForm[2].setAttribute("disabled", "true");
    emailForm[2].innerText = "Sending";
  
    const url = fileURL.value;
  
    const formData = {
      uuid: url.split("/").splice(-1, 1)[0],
      emailTo: emailForm.elements["to-email"].value,
      emailFrom: emailForm.elements["from-email"].value,
    };
    console.log(formData);
    fetch(emailURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast("Email Sent");
          sharingContainer.style.display = "none"; // hide the box
        }
      });
  });
  
  let toastTimer;
  // the toast function
  const showToast = (msg) => {
    clearTimeout(toastTimer);
    toast.innerText = msg;
    toast.classList.add("show");
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  };


