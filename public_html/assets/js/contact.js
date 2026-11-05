const contactForm = document.getElementById("contactEnquiry");
const contactStatus = document.getElementById("contactStatus");

if (contactForm && contactStatus) {
  contactForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    contactStatus.textContent = "Sending your enquiry.";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || "Your enquiry could not be sent.");

      contactForm.reset();
      contactStatus.textContent = "Thank you. Your enquiry has been sent to Legacies Global.";
    } catch (error) {
      contactStatus.textContent = `${error.message} Please email legacies@legacies.global.`;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send enquiry";
    }
  });
}
