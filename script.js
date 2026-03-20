// 🔥 Firebase Imports
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import app from "./firebase-config.js";

const db = getFirestore(app);
const auth = getAuth(app);

// 🌐 Global Variables
let notes = [];
let notesGrid;
let searchInput;
let currentUser = null;
let authBtn;
let authBtnText;
let authBtnFooter;
let authBtnFooterText;

const provider = new GoogleAuthProvider();

function updateAuthButton() {
    if (authBtnText) {
        if (currentUser) {
            authBtnText.innerText = "Logout";
        } else {
            authBtnText.innerText = "Admin Login";
        }
    }
    if (authBtnFooterText) {
        if (currentUser) {
            authBtnFooterText.innerText = "Logout";
        } else {
            authBtnFooterText.innerText = "Admin";
        }
    }
}

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateAuthButton();
    loadNotes(); // Reload notes to show/hide delete buttons
});

// =======================================
// 🔐 AUTH FUNCTIONS
// =======================================
async function handleAuth() {
    if (currentUser) {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
            alert("Logout Error: " + error.message);
        }
    } else {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login Error: " + error.message);
        }
    }
}

// 🔥 Cloudinary Config (REPLACE THESE)
const CLOUD_NAME = "dswjeput7";
const UPLOAD_PRESET = "notes pdf";
const CLOUDINARY_API_KEY = "969919581637318"; // Needed for Destroy API
const CLOUDINARY_API_SECRET = "r9Z6TVPpvCrUBIh47OG4zYyueeI"; // Needed for Destroy API

// =======================================
// 🚀 LOAD NOTES FROM FIREBASE
// =======================================
async function loadNotes() {
    notes = [];

    const querySnapshot = await getDocs(collection(db, "notes"));

    querySnapshot.forEach((doc) => {
        const data = doc.data();

        notes.push({
            id: doc.id,
            title: data.title,
            url: data.url,
            public_id: data.public_id,
            date: new Date().toLocaleDateString()
        });
    });

    displayNotes(notes);
}

// =======================================
// 🎨 DISPLAY NOTES
// =======================================
function displayNotes(notesArray) {
    notesGrid.innerHTML = "";

    const notesCount = document.getElementById("notesCount");
    if (notesCount) {
        notesCount.innerText = `${notesArray.length} Notes`;
    }

    if (notesArray.length === 0) {
        notesGrid.innerHTML = `<div class="empty-state">
            <p>No notes available. Be the first to upload!</p>
        </div>`;
        return;
    }

    notesArray.forEach(note => {
        const div = document.createElement("div");
        div.className = "note-card glass-card";

        div.innerHTML = `
            <div class="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            </div>
            <div class="card-content">
                <h3>${note.title}</h3>
                <p class="file-name">Uploaded on ${note.date || new Date().toLocaleDateString()}</p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <a class="btn-download" href="${note.url}" target="_blank" style="flex: 1;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download
                    </a>
                    ${currentUser?.email === 'heisenberg020018@gmail.com' ? `
                    <button class="btn-delete" style="background: rgba(255,50,50,0.2); color: #ff4444; border: 1px solid rgba(255,50,50,0.3); padding: 8px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onclick="window.deleteNote('${note.id}', '${note.public_id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                    ` : ''}
                </div>
            </div>
        `;

        notesGrid.appendChild(div);
    });
}

// =======================================
// 🔍 SEARCH FUNCTION
// =======================================
function searchNotes() {
    const query = searchInput.value.toLowerCase();

    const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(query)
    );

    displayNotes(filtered);
}

// =======================================
// ☁️ UPLOAD FILE (CLOUDINARY + FIREBASE)
// =======================================
async function uploadFile() {

    const titleInput = document.getElementById("noteTitle");
    const fileInput = document.getElementById("noteFile");
    const submitBtn = document.querySelector("#uploadForm button[type='submit']");

    const file = fileInput.files[0];
    const title = titleInput.value;

    if (!file || !title) {
        alert("Enter title and select file");
        return;
    }

    if (submitBtn) {
        submitBtn.innerHTML = '<span>Uploading...</span><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-loader"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>';
        submitBtn.disabled = true;
    }

    // 🌐 Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("resource_type", "raw"); // Change to "raw" for PDFs

    try {
        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error?.message || "Cloudinary upload failed");
        }

        const fileURL = data.secure_url;
        const publicId = data.public_id;

        // 🔥 Save to Firebase
        await addDoc(collection(db, "notes"), {
            title: title,
            url: fileURL,
            public_id: publicId
        });

        alert("Upload successful!");

        // Clear inputs
        titleInput.value = "";
        fileInput.value = "";

        const fileInfo = document.getElementById("fileInfo");
        if (fileInfo) {
            fileInfo.textContent = "No file selected";
            fileInfo.classList.add("hidden");
        }

        loadNotes(); // refresh notes

    } catch (error) {
        console.error(error);
        alert("Upload failed: " + error.message);
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = '<span>Upload Note</span><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
            submitBtn.disabled = false;
        }
    }
}

// =======================================
// 🗑️ DELETE NOTE FUNCTION
// =======================================
window.deleteNote = async function (docId, publicId) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
        // 1. Delete from Firestore
        await deleteDoc(doc(db, "notes", docId));

        // 2. Delete from Cloudinary using Destroy API
        if (publicId && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
            const timestamp = Math.floor(new Date().getTime() / 1000);

            // Generate SHA-1 Signature
            const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
            const encoder = new TextEncoder();
            const data = encoder.encode(stringToSign);
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const formData = new FormData();
            formData.append("public_id", publicId);
            formData.append("api_key", CLOUDINARY_API_KEY);
            formData.append("timestamp", timestamp);
            formData.append("signature", signature);
            // Even though PDFs use 'raw', some destroy APIs need 'image' if not specified, 
            // but for 'raw' uploads, we must specify resource_type directly or use the correct endpoint
            formData.append("resource_type", "raw");

            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/destroy`, {
                method: 'POST',
                body: formData
            });

            const cloudinaryData = await res.json();
            if (cloudinaryData.result !== 'ok') {
                console.warn("Cloudinary delete result:", cloudinaryData);
            }
        }

        alert("Note deleted successfully!");
        loadNotes(); // Refresh grid
    } catch (error) {
        console.error("Error deleting note:", error);
        alert("Error deleting note: " + error.message);
    }
};

// =======================================
// 🚀 DOM READY
// =======================================
document.addEventListener("DOMContentLoaded", () => {

    notesGrid = document.getElementById("notesGrid");
    searchInput = document.getElementById("searchInput");
    authBtn = document.getElementById("authBtn");
    authBtnText = document.getElementById("authBtnText");
    authBtnFooter = document.getElementById("authBtnFooter");
    authBtnFooterText = document.getElementById("authBtnFooterText");

    updateAuthButton(); // sync state in case auth loaded before DOM

    if (authBtn) {
        authBtn.addEventListener("click", handleAuth);
    }
    if (authBtnFooter) {
        authBtnFooter.addEventListener("click", handleAuth);
    }

    // Load notes
    loadNotes();

    // Search listener
    searchInput.addEventListener("input", searchNotes);

    // File Info Updater
    const noteFile = document.getElementById("noteFile");
    const fileInfo = document.getElementById("fileInfo");
    if (noteFile && fileInfo) {
        noteFile.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                fileInfo.textContent = e.target.files[0].name;
                fileInfo.classList.remove("hidden");
            } else {
                fileInfo.textContent = "No file selected";
                fileInfo.classList.add("hidden");
            }
        });
    }

    // Form submit
    const uploadForm = document.getElementById("uploadForm");

    uploadForm.addEventListener("submit", (e) => {
        e.preventDefault();
        uploadFile();
    });

});