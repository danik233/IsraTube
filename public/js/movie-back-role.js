// needs for admin, when press on movie into DB table.
window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);

    const adminMode = params.get("admin") === "true";
    const backToAdmin = document.getElementById("backToAdminBtn");
    const backToSearch = document.getElementById("backToSearch");

    if (adminMode) {
        backToAdmin.style.display = "inline-block";
        backToSearch.style.display = "none";
    }
});