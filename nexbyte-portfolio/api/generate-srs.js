require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  // Log to check if the API key is loaded
  console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const {
    projectName,
    projectDescription,
    targetAudience,
    functionalRequirements,
    nonFunctionalRequirements,
    client,
  } = req.body;

  if (!projectName) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  const prompt = `
    Generate a detailed Software Requirement Specification (SRS) document based on the following details:

    **Project Name:** ${projectName}

    **Client Information:**
    - **Client Name:** ${client?.clientName || 'N/A'}
    - **Contact Person:** ${client?.contactPerson || 'N/A'}
    - **Email:** ${client?.email || 'N/A'}

    **1. Introduction:**
       1.1. **Project Overview:** ${projectDescription || 'Provide a detailed overview of the project.'}
       1.2. **Scope:** Define the scope of the project based on the requirements.
       1.3. **Target Audience:** ${targetAudience || 'Describe the target audience for this project.'}

    **2. Overall Description:**
       2.1. **Product Perspective:** Describe the product's relationship to other products or projects.
       2.2. **User Characteristics:** Describe the intended users.
       2.3. **Assumptions and Dependencies:** List any assumptions or dependencies.

    **3. System Features and Requirements:**
       3.1. **Functional Requirements:**
            ${functionalRequirements || 'Detail the functional requirements. These should be specific and measurable.'}

       3.2. **Non-Functional Requirements:**
            ${nonFunctionalRequirements || 'Detail the non-functional requirements, such as performance, security, reliability, and usability.'}

    **4. External Interface Requirements:**
       4.1. **User Interfaces:** Describe the user interface requirements.
       4.2. **Hardware Interfaces:** Describe any hardware interfaces.
       4.3. **Software Interfaces:** Describe any software interfaces.
       4.4. **Communications Interfaces:** Describe any communications interfaces.

    **5. Other Appendices:**
       - Include any other relevant information, such as a glossary, analysis models, or issues list.

    Please generate a comprehensive and well-structured SRS document based on this information. The output should be in Markdown format.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    res.status(200).json({ srsContent: response.choices[0].message.content });
  } catch (error) {
    // Log the detailed error from OpenAI
    console.error('Error generating SRS from OpenAI:', error);
    res.status(500).json({ message: 'Failed to generate SRS', error: error.message });
  }
};
