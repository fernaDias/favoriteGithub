export const GithubUser = {
  search(username) {
    const endpoint = `https://api.github.com/users/${username}`;
    return fetch(endpoint)
      .then((data) => data.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        public_repos,
        followers,
      }));
  },
};

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
    GithubUser.search("fernadias").then((user) => {
      console.log(user);
    });
  }

  load() {
    const entries = JSON.parse(localStorage.getItem("@github-favorites")) || [];
    this.entries = [
      { login: "fernadias", public_repos: 76, followers: 86 },
      { login: "MaykBrito", public_repos: 106, followers: 2000 },
      { login: "diego3g", public_repos: 789, followers: 3000 },
    ];
  }

  async add(username) {
    const user = await GithubUser.search(username);
  }

  delete(user) {
    const filteredEntreis = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filteredEntreis;
    this.update();
    this.onAdd();
  }
}

// Class to create view with html events
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = this.root.querySelector("table tbody");
    this.update();
  }

  onAdd() {
    const addButton = this.root.querySelector(".search button");
    const input = this.root.querySelector(".search input");

    addButton.onclick = () => {
      const { value } = input;
      this.add(value);
    };
  }

  update() {
    this.removeAllTr();

    // biome-ignore lint/complexity/noForEach: <explanation>
    this.entries.forEach((user) => {
      const row = this.createRow(user);

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;

      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user p").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onClick = () => {
        const isOk = confirm("Are you sure you want to remove this user?");
        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
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
    // biome-ignore lint/complexity/noForEach: <explanation>
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
