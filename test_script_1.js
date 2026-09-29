
                            function updateDivBatch() {
                                const div = document.getElementById('assign-div-select').value;
                                const batch = document.getElementById('assign-batch-select').value;
                                let val = "";
                                if(div) val += div;
                                if(batch) val += (val ? "-" : "") + batch;
                                document.getElementById('assign-div').value = val;
                            }
                        