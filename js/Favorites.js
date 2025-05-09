import { GithubUser } from "./GithubUser.js";
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username);

      if (userExists) {
        throw new Error("User already exists");
      }

      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error("User not found");
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntreis = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filteredEntreis;
    this.update();
    this.save();
  }
}

// Class to create view with html events
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = this.root.querySelector("table tbody");
    this.update();
    this.onAdd();
  }

  onAdd() {
    const addButton = this.root.querySelector(".search button");

    addButton.onclick = () => {
      const input = this.root.querySelector(".search input");
      const { value } = input;
      this.add(value);
    };
  }

  update() {
    this.removeAllTr();

    for (const user of this.entries) {
      const row = this.createRow(user);

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;

      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user p").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Are you sure you want to remove this user?");
        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    }
  }

  createRow(user) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td class="user">
              <img
                src="https://github.com/${user.login}.png"
                alt="Image of ${user.login}"
              />
              <a href="https://github.com/${user.login}" target="_blank">
                <p>${user.login}</p>
                <span>${user.login}</span>
              </a>
            </td>
            <td class="repositories">${user.public_repos}</td>
            <td class="followers">${user.followers}</td>
            <td><button class="remove">&times;</button></td>
            `;

    return tr;
  }

  removeAllTr() {
    for (const tr of this.tbody.querySelectorAll("tr")) {
      tr.remove();
    }
  }
}
