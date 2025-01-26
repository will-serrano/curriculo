const { jsPDF } = window.jspdf;

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
                container.appendChild(createSection("skills", buildSkills(data)));
                container.appendChild(createSection("experience", buildExperience(data)));
                container.appendChild(createSection("education", buildEducation(data)));
                container.appendChild(createSection("language", buildLanguage(data)));
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

        const buildSkills = (data) => {
            let skillsHTML = `<h3>${data.titulos.competencias}</h3><div class="skills">`;
        
            data.competencias.forEach(skill => {
                skillsHTML += `<span>${skill}</span>`;
            });
        
            skillsHTML += '</div>';
            return skillsHTML;
        };

        const buildSummary = (data) => `
            <h3>${data.titulos.resumo}</h3>
            <p>${data.resumo}</p>
        `;

        const buildExperience = (data) => {
            let experienceHTML = `<h3>${data.titulos.experiencia}</h3>`;
            data.experiencias.forEach(job => {
                experienceHTML += `
                    <div class="job">
                        <h4>${job.empresa} | ${job.cargo}</h4>
                        <p><strong>${data.titulos.periodo}:</strong> ${job.periodo}</p>
                        <ul>
                            ${job.descricao.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                        <p><strong>${data.titulos.tecnologia}:</strong></p>
                        <div class="technologies">
                            ${job.tecnologias.map(tech => `<span>${tech}</span>`).join('')}
                        </div>
                    </div>
                `;
            });
            return experienceHTML;
        };
        
        const buildLanguage = (data) => {
            // Adiciona o título da seção
            let languageHTML = `<h3>${data.titulos.idiomas}</h3>`;
        
            // Itera sobre os idiomas no JSON e cria um bloco para cada um
            data.idiomas.forEach(lang => {
                languageHTML += `
                    <div class="language-item">
                        <p><strong>${lang.idioma}</strong> - ${lang.nivel}</p>
                    </div>
                `;
            });
        
            return languageHTML;
        };

        const buildEducation = (data) => {
            // Adiciona o título da seção
            let educationHTML = `<h3>${data.titulos.educacao}</h3>`;
        
            // Itera sobre as instituições no JSON e cria um bloco para cada uma
            data.educacao.forEach(edu => {
                educationHTML += `
                    <div class="education-item">
                        <p><strong>${edu.instituicao}</strong> - ${edu.curso}</p>
                    </div>
                `;
            });
        
            return educationHTML;
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

        const downloadPDF = async () => {
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });
        
            const data = await fetchData(currentLanguage);
            let yPosition = 20;
        
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(16);
            doc.text(data.nome, 105, yPosition, { align: "center" });
            yPosition += 10;
        
            doc.setFont("Helvetica", "normal");
            doc.setFontSize(14);
            doc.text(data.titulo, 105, yPosition, { align: "center" });
            yPosition += 20;
        
            doc.setFontSize(12);
            doc.text("Resumo Profissional:", 10, yPosition);
            yPosition += 10;
            const resumo = doc.splitTextToSize(data.resumo, 180);
            doc.text(resumo, 10, yPosition);
            yPosition += resumo.length * 8;
        
            doc.text("Experiência Profissional:", 10, yPosition);
            yPosition += 10;
        
            data.experiencias.forEach((job) => {
                doc.setFont("Helvetica", "bold");
                doc.text(`${job.empresa} | ${job.cargo}`, 10, yPosition);
                yPosition += 8;
        
                doc.setFont("Helvetica", "normal");
                doc.text(`Período: ${job.periodo}`, 10, yPosition);
                yPosition += 8;
        
                doc.text("Descrição:", 10, yPosition);
                yPosition += 8;
                job.descricao.forEach((desc) => {
                    doc.text(`- ${desc}`, 10, yPosition);
                    yPosition += 8;
                });
        
                doc.text("Tecnologias Utilizadas:", 10, yPosition);
                yPosition += 8;
                job.tecnologias.forEach((tech) => {
                    doc.text(`- ${tech}`, 10, yPosition);
                    yPosition += 8;
                });
        
                yPosition += 10; // Espaço entre experiências
            });
        
            doc.save(`${data.nome.replaceAll(" ", "_")}_curriculo.pdf`);
        };      

        return {
            renderCurriculo,
            changeLanguage,
            changeTheme,
            downloadPDF
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

    document.querySelector("#download-pdf").addEventListener("click", () => {
        CurriculoModule.downloadPDF();
    });
})();
