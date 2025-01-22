(function () {
    const CurriculoModule = (function () {
        let currentLanguage = "pt-br"; // Idioma padrão
        let currentTheme = "light"; // Tema padrão

        // Função para carregar os dados do JSON do idioma selecionado
        const fetchData = async (language) => {
            try {
                const response = await fetch(`files/data.${language}.json`);
                return await response.json();
            } catch (error) {
                console.error(`Erro ao carregar o JSON (${language}):`, error);
                return null;
            }
        };

        // Função principal para renderizar o currículo
        const renderCurriculo = async () => {
            const data = await fetchData(currentLanguage);
            if (data) {
                const container = document.querySelector("#curriculo");
                container.innerHTML = ""; // Limpa o conteúdo existente

                // Adiciona as seções
                container.appendChild(createSection("header", buildHeader(data)));
                container.appendChild(createSection("contact", buildContact(data)));
                container.appendChild(createSection("summary", buildSummary(data)));
                container.appendChild(createSection("experience", buildExperience(data)));
            }
        };

        // Funções de Construção de Seções
        const buildHeader = (data) => `
            <h1>${data.nome}</h1>
            <h2>${data.titulo}</h2>
        `;

        const buildContact = (data) => `
            <p>${data.contato.localizacao} | ${data.contato.telefone} | 
            <a href="mailto:${data.contato.email}">${data.contato.email}</a></p>
        `;

        const buildSummary = (data) => `
            <h3>Resumo Profissional</h3>
            <p>${data.resumo}</p>
        `;

        const buildExperience = (data) => {
            let experienceHTML = '<h3>Experiência Profissional</h3>';
            data.experiencias.forEach(job => {
                experienceHTML += `
                    <div class="job">
                        <h4>${job.empresa} | ${job.cargo}</h4>
                        <p><strong>Período:</strong> ${job.periodo}</p>
                        <p>${job.descricao}</p>
                        <p><strong>Tecnologias:</strong> ${job.tecnologias}</p>
                    </div>
                `;
            });
            return experienceHTML;
        };

        // Função para criar uma seção
        const createSection = (id, content) => {
            const section = document.createElement("div");
            section.id = id;
            section.className = "section";
            section.innerHTML = content;
            return section;
        };

        // Alternar Idioma
        const changeLanguage = (language) => {
            currentLanguage = language;
            renderCurriculo();
        };

        // Alternar Tema
        const changeTheme = (theme) => {
            currentTheme = theme;
            document.body.className = theme;
        };

        return {
            renderCurriculo,
            changeLanguage,
            changeTheme
        };
    })();

    // Inicializa o módulo
    CurriculoModule.renderCurriculo();

    // Eventos para mudar idioma e tema
    document.querySelector("#language-switch").addEventListener("change", (event) => {
        CurriculoModule.changeLanguage(event.target.value);
    });

    document.querySelector("#theme-switch").addEventListener("change", (event) => {
        CurriculoModule.changeTheme(event.target.value);
    });
})();
