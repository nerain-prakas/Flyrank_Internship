const PDFDocument = require('pdfkit');

function writeReport(res, project, report, sources) {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="research-${project.id}.pdf"`);
  doc.pipe(res);
  doc.fontSize(20).text('AI Web Research Assistant');
  doc.moveDown().fontSize(14).text(project.question);
  doc.moveDown().fontSize(11).text(report.summary);
  for (const [heading, values] of [['Key findings', report.key_findings], ['Important facts', report.important_facts], ['Limitations', report.limitations]]) {
    doc.moveDown().fontSize(14).text(heading);
    values.forEach(value => doc.fontSize(11).text(`• ${value}`));
  }
  doc.moveDown().fontSize(14).text('Sources');
  sources.forEach(source => doc.fontSize(10).text(`${source.title || source.url} — ${source.url}`));
  doc.end();
}

module.exports = { writeReport };
