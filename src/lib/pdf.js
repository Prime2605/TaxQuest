import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateMudraReport = async (profile) => {
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.background = '#1e1b4b';
    element.style.color = 'white';
    element.style.width = '800px';
    element.style.fontFamily = 'sans-serif';

    element.innerHTML = `
    <div style="border: 2px solid #6366f1; padding: 20px; border-radius: 20px;">
      <h1 style="color: #6366f1; margin: 0; font-size: 32px;">MUDRA READY REPORT</h1>
      <p style="text-transform: uppercase; letter-spacing: 2px; font-weight: bold; color: #a5b4fc;">TaxQuest Verification Service</p>
      
      <hr style="border: none; border-top: 1px solid #ffffff20; margin: 20px 0;" />
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div>
          <p style="margin: 0; opacity: 0.6; font-size: 12px;">BUSINESS IDENTIFIER</p>
          <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${profile?.gstin || 'UNVERIFIED'}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; opacity: 0.6; font-size: 12px;">COMPLIANCE SCORE</p>
          <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #6366f1;">${profile?.compliance_score || 0}%</p>
        </div>
      </div>

      <div style="background: #ffffff05; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="margin: 0; font-size: 16px;">TRADER CREDENTIALS</h3>
        <p style="margin: 10px 0; font-size: 14px;">Rank: Level ${profile?.level || 1} Informal Trader</p>
        <p style="margin: 5px 0; font-size: 14px;">Total XP Earned: ${profile?.xp || 0}</p>
        <p style="margin: 5px 0; font-size: 14px;">Status: Active & Compliant</p>
      </div>

      <div style="border-left: 4px solid #6366f1; padding-left: 15px; margin-top: 40px;">
        <p style="font-size: 12px; font-style: italic; opacity: 0.8;">
          This report is digitally signed and generated via TaxQuest GSP interface. 
          It certifies that the holder has maintained a consistent record of tax compliance 
          and is qualified for further business expansion loans under the Mudra Scheme.
        </p>
      </div>

      <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <p style="margin: 0; font-size: 10px; opacity: 0.5;">DATE OF ISSUE</p>
          <p style="margin: 0; font-size: 12px;">${new Date().toLocaleDateString()}</p>
        </div>
        <div style="width: 100px; hieght: 100px; background: white; padding: 5px; border-radius: 5px;">
           <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TAXQUEST-VERIFIED-${profile?.gstin}" style="width: 100%;" />
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(element);

    const canvas = await html2canvas(element, {
        backgroundColor: '#1e1b4b',
        scale: 2
    });

    document.body.removeChild(element);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save(`Mudra_Report_${profile?.gstin || 'Trader'}.pdf`);
};
