(function () {
    const CurriculoModule = (function () {
        let currentLanguage = "pt-br"; // Idioma padrão
        let currentTheme = "light"; // Tema padrão
        let techCount = {}; // Move techCount to the outer scope

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
                createPieChart(techCount, data); // Passa o objeto data para createPieChart
            }
        };

        // Funções de Construção de Seções
        const buildHeader = (data) => `
            <h1>${data.name}</h1>
            <h2>${data.title}</h2>
        `;

        const buildContact = (data) => `
            <p>${data.contact.location} | ${data.contact.availability} | 
            <a href="mailto:${data.contact.email}">${data.contact.email}</a></p>
        `;

        const buildSkills = (data) => {
            let skillsHTML = `<h3>${data.titles.skills}</h3><div class="skills">`;
        
            data.skills.forEach(skill => {
                skillsHTML += `<span>${skill}</span>`;
            });
        
            skillsHTML += '</div>';
            return skillsHTML;
        };

        const buildSummary = (data) => `
            <h3>${data.titles.summary}</h3>
            <p>${data.summary}</p>
        `;

        const buildExperience = (data) => {
            let experienceHTML = `<h3>${data.titles.experience}</h3>`;
            techCount = {}; // Reset techCount
            const ungroupedTechnologies = [];
            const unusedTechnologies = [];

            // Inicializa o contador de tecnologias
            Object.keys(data['technology-categories']).forEach(category => {
                const translatedCategory = data['report-titles'][category] || category;
                techCount[translatedCategory] = [];
                data['technology-categories'][category].forEach(tech => {
                    techCount[translatedCategory].push({ name: tech, count: 0 });
                });
            });

            data.experiences.forEach(job => {
                experienceHTML += `
                    <div class="job">
                        <h4>${job.company} | ${job.position}</h4>
                        <p><strong>${data.titles.period}:</strong> ${job.period}</p>
                        <ul>
                            ${job.description.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                        <p><strong>${data.titles.technology}:</strong></p>
                        <div class="technologies">
                            ${job.technologies.map(tech => {
                                let found = false;
                                Object.keys(techCount).forEach(category => {
                                    techCount[category].forEach(techObj => {
                                        if (techObj.name === tech) {
                                            techObj.count += 1;
                                            found = true;
                                        }
                                    });
                                });
                                if (!found) {
                                    ungroupedTechnologies.push(tech);
                                }
                                return `<span>${tech}</span>`;
                            }).join('')}
                        </div>
                    </div>
                `;
            });

            // Lista as categorias-tecnologias não utilizadas
            Object.keys(data['technology-categories']).forEach(category => {
                const translatedCategory = data['report-titles'][category] || category;
                techCount[translatedCategory].forEach(tech => {
                    if (tech.count === 0) {
                        unusedTechnologies.push(`${tech.name} (${translatedCategory})`);
                    }
                });
            });

            console.log('Ungrouped Technologies:', ungroupedTechnologies); // Para verificar as tecnologias não agrupadas no console
            console.log('Academic or Personal Knowledge:', unusedTechnologies); // Para verificar as tecnologias não utilizadas no console
            console.log('Technology Counts:', techCount); // Exibe a contagem de tecnologias no console

            return experienceHTML;
        };

        const buildLanguage = (data) => {
            // Adiciona o título da seção
            let languageHTML = `<h3>${data.titles.languages}</h3>`;
        
            // Itera sobre os idiomas no JSON e cria um bloco para cada um
            data.languages.forEach(lang => {
                languageHTML += `
                    <div class="language-item">
                        <p><strong>${lang.language}</strong> - ${lang.level}</p>
                    </div>
                `;
            });
        
            return languageHTML;
        };

        const buildEducation = (data) => {
            // Adiciona o título da seção
            let educationHTML = `<h3>${data.titles.education}</h3>`;
        
            // Itera sobre as instituições no JSON e cria um bloco para cada uma
            data.education.forEach(edu => {
                educationHTML += `
                    <div class="education-item">
                        <p><strong>${edu.institution}</strong> - ${edu.course}</p>
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

        // Função para criar um gráfico de pizza
        const createPieChart = (techCount, data) => {
            const container = document.querySelector("#curriculo");
            const existingCanvas = document.querySelector('#techPieChart');
            if (existingCanvas) {
                existingCanvas.remove();
            }

            const canvas = document.createElement('canvas');
            canvas.id = 'techPieChart';
            container.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            const categories = Object.keys(techCount).map(category => data['report-titles'][category] || category).filter(Boolean);
            const chartData = categories.map(category => {
                const techCategory = techCount[category];
                return techCategory ? techCategory.reduce((sum, tech) => sum + tech.count, 0) : 0;
            });

            const colors = [
                // Cores primárias
                '#FF0000', // Vermelho
                '#0000FF', // Azul
                '#FFFF00', // Amarelo
                
                // Cores secundárias (misturas das primárias)
                '#00FF00', // Verde (Amarelo + Azul)
                '#FF00FF', // Magenta (Vermelho + Azul)
                '#00FFFF', // Ciano (Azul + Verde)
            
                // Cores terciárias e complementares
                '#800000', // Marrom avermelhado
                '#808000', // Verde-oliva
                '#008000', // Verde escuro
                '#800080', // Roxo
                '#008080', // Verde-azulado
                '#FFA500', // Laranja
                '#FFC0CB', // Rosa claro
                '#DC143C', // Carmesim
                '#8A2BE2', // Azul violeta
                '#D2691E', // Chocolate
                '#2E8B57', // Verde mar profundo
                '#4682B4', // Azul aço
                '#C9CBCF', // Cinza claro
                '#000000'  // Preto
            ];

            if (categories.length > 0 && chartData.length > 0) {
                new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: categories,
                        datasets: [{
                            data: chartData,
                            backgroundColor: colors.slice(0, categories.length),
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Technology Usage by Category'
                            }
                        }
                    }
                });
            } else {
                console.warn('No data available for the pie chart.');
            }
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
