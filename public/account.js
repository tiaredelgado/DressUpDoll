document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createForm');
    const message = document.getElementById('message');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const formData = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        password: form.password.value
      };
  
      try {
        const res = await fetch('/createAccount', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
  
        const data = await res.json();
        message.textContent = data.message;
        message.style.color = data.success ? 'green' : 'red';
      } catch (err) {
        message.textContent = 'Something went wrong.';
        message.style.color = 'red';
      }
    });
  });
  