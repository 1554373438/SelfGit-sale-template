
svn delete svn://192.168.1.40/MSI-FE/h5/nono/sale-template -m "delete sale-template"
svn mkdir svn://192.168.1.40/MSI-FE/h5/nono/sale-template -m "create sale-template"
svn import ./dist/ svn://192.168.1.40/MSI-FE/h5/nono/sale-template -m "upload dist"