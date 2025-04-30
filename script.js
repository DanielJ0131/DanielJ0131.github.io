document.addEventListener("DOMContentLoaded", () => {
    let dishIds = []
    const dishTableBody = document.getElementById("dishTableBody");
    const addDishForm = document.getElementById("addDishForm")
    // Fetch all dishes and populate the table
    async function fetchDishes() {
        try {
            const response = await fetch('/api/dishes');
            if (!response.ok) {
                throw new Error("Failed to fetch dishes");
            }
            const dishes = await response.json();
            populateTable(dishes);
        } catch (error) {
            console.error("Error fetching dishes:", error);
        }
    }

    // Populate the table with dishes
    function populateTable(dishes) {
        dishTableBody.innerHTML = ""; // Clear existing rows
        dishIds = dishes.map(dish => dish.id);
        dishes.forEach(dish => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${dish.id}</td>
                <td>${dish.name}</td>
                <td>${dish.ingredients}</td>
                <td>${dish.preparationSteps.map((step, index) => `${index + 1}. ${step}<br>`).join('')}</td>
                <td>${dish.cookingTime}</td>
                <td>${dish.origin}</td>
                <td>${dish.spiceLevel}</td>
                <td>
                    <button class="update-dish" data-id="${dish.id}">Update</button>
                    <button class="delete-dish" data-id="${dish.id}">Delete</button>
                </td>
            `;
            dishTableBody.appendChild(row);
        });
    }

    // Add event listeners for update and delete buttons dynamically
    dishTableBody.addEventListener("click", (event) => {
        if (event.target.classList.contains("update-dish")) {
            updateDish(event.target.dataset.id);
        } else if (event.target.classList.contains("delete-dish")) {
            deleteDish(event.target.dataset.id);
        }
    });

    // Add event listeners for put button dynamically
    addDishForm.addEventListener("submit", async (event) => {
        event.preventDefault()
        const formData = new FormData(addDishForm);
        const newDish = {
            // Auto increment id
            id: dishIds.length + 1,
            name: formData.get("name"),
            ingredients: formData.get("ingredients"),
            preparationSteps: formData.get("preparationSteps"),
            cookingTime: formData.get("cookingTime"),
            origin: formData.get("origin"),
            spiceLevel: formData.get("spiceLevel"),
        };

        try {
            const response = await fetch('/api/dishes', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newDish),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    alert("Failed to add dish: Duplicate entry detected.");
                }
                throw new Error("Failed to add dish");

            }

            alert('Added new dish!')
            addDishForm.reset();
            fetchDishes(); // Refresh the table
        } catch (error) {
            console.error("Error adding dish:", error);
        }
    });

    // Delete a dish
    function deleteDish(id) {
        return (async () => {
            try {
                const response = await fetch(`/api/dishes/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to delete dish");
                }
                alert(`Deleting dish with id ${id}`)
                fetchDishes(); // Refresh the table
            } catch (error) {
                console.error("Error deleting dish:", error);
            }
        })();
    }

    // Update a dish
    function updateDish(id) {
        const row = document.querySelector(`button[data-id="${id}"]`).closest("tr");
        const cells = row.querySelectorAll("td");

        // Replace table cells with input fields
        const dishData = {
            id: cells[0].textContent,
            name: cells[1].textContent,
            ingredients: cells[2].textContent,
            preparationSteps: cells[3].innerHTML.replace(/<br>/g, "").split(/\d+\.\s/).filter(Boolean),
            cookingTime: cells[4].textContent,
            origin: cells[5].textContent,
            spiceLevel: cells[6].textContent,
        };

        cells[1].innerHTML = `<input type="text" value="${dishData.name}" />`;
        cells[2].innerHTML = `<input type="text" value="${dishData.ingredients}" />`;
        cells[3].innerHTML = `<textarea>${dishData.preparationSteps.join("\n")}</textarea>`;
        cells[4].innerHTML = `<input type="text" value="${dishData.cookingTime}" />`;
        cells[5].innerHTML = `<input type="text" value="${dishData.origin}" />`;
        cells[6].innerHTML = `<input type="text" value="${dishData.spiceLevel}" />`;
        cells[7].innerHTML = `
            <button class="confirm-update" data-id="${id}">Confirm</button>
        `;

        // Handle confirm action
        row.querySelector(".confirm-update").addEventListener("click", async () => {
            const updatedDish = {
                id: dishData.id,
                name: cells[1].querySelector("input").value,
                ingredients: cells[2].querySelector("input").value,
                preparationSteps: cells[3].querySelector("textarea").value.split("\n"),
                cookingTime: cells[4].querySelector("input").value,
                origin: cells[5].querySelector("input").value,
                spiceLevel: cells[6].querySelector("input").value,
            };

            // Check if any content in the updated dish is equal to the original dish data
            if (
                updatedDish.name === dishData.name &&
                updatedDish.ingredients === dishData.ingredients &&
                JSON.stringify(updatedDish.preparationSteps) === JSON.stringify(dishData.preparationSteps) &&
                updatedDish.cookingTime === dishData.cookingTime &&
                updatedDish.origin === dishData.origin &&
                updatedDish.spiceLevel === dishData.spiceLevel
            ) {
                alert("No changes detected.");
                fetchDishes(); // Refresh the table to revert input fields
                return;
            }

            try {
                const response = await fetch(`/api/dishes/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedDish),
                });

                if (!response.ok) {
                    throw new Error("Failed to update dish");
                }

                alert(`Updating dish with id ${id}`)
                fetchDishes(); // Refresh the table
            } catch (error) {
                console.error("Error updating dish:", error);
            }
        });
    }
    // Initial fetch to populate the table
    fetchDishes();
});